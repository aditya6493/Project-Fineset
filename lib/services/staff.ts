import { prisma } from "@/lib/db/prisma";
import { inviteUser } from "@/lib/auth/invite-user";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/validations/staff.schema";
import type { StaffPerformanceRow } from "@/types";
import type { Prisma } from "@prisma/client";
import {
  calculateAvgTransaction,
  calculateConversionRate,
  calculateTotalRevenue,
} from "@/lib/utils/analytics";

export class StaffDeleteError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "StaffDeleteError";
  }
}

export async function listStaff(storeId: string) {
  const staff = await prisma.staff.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
    include: {
      appUser: {
        select: {
          email: true,
        },
      },
      visits: {
        select: {
          purchaseStatus: true,
          transactionAmount: true,
        },
      },
      _count: {
        select: {
          fieldSales: true,
          assignedFollowUps: true,
        },
      },
    },
  });

  const staffIds = staff.map((member) => member.id);
  const openFollowUps =
    staffIds.length === 0
      ? []
      : await prisma.followUp.groupBy({
          by: ["assignedStaffId"],
          where: {
            assignedStaffId: { in: staffIds },
            status: "OPEN",
          },
          _count: { _all: true },
        });

  const followUpCountByStaff = new Map(
    openFollowUps.map((row) => [row.assignedStaffId, row._count._all]),
  );

  return staff.map((member) => {
    const visits = member.visits;
    const hasActivity =
      visits.length > 0 ||
      member._count.fieldSales > 0 ||
      member._count.assignedFollowUps > 0;

    return {
      id: member.id,
      name: member.name,
      employeeId: member.employeeId,
      email: member.appUser?.email ?? null,
      createdAt: member.createdAt,
      isActive: member.isActive,
      visitCount: visits.length,
      canDelete: !hasActivity,
      monthlyVisits: visits.length,
      monthlyRevenue: calculateTotalRevenue(visits),
      conversionRate: calculateConversionRate(visits),
      openFollowUps: followUpCountByStaff.get(member.id) ?? 0,
    };
  });
}

export async function createStaff(storeId: string, input: CreateStaffInput) {
  return inviteUser({
    name: input.name,
    email: input.email,
    password: input.password,
    role: "STAFF",
    storeId,
    employeeId: input.employeeId,
  });
}

export async function updateStaff(
  staffId: string,
  storeId: string,
  input: UpdateStaffInput,
) {
  return prisma.staff.updateMany({
    where: { id: staffId, storeId },
    data: input,
  });
}

export async function deleteStaff(staffId: string, storeId: string) {
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, storeId },
    include: {
      appUser: { select: { id: true, authId: true } },
      _count: {
        select: {
          visits: true,
          fieldSales: true,
          assignedFollowUps: true,
        },
      },
    },
  });

  if (!staff) {
    throw new StaffDeleteError("Staff member not found", 404);
  }

  const { visits, fieldSales, assignedFollowUps } = staff._count;
  if (visits > 0 || fieldSales > 0 || assignedFollowUps > 0) {
    throw new StaffDeleteError(
      "Cannot delete staff with existing visits, field sales, or follow-ups. Mark them inactive instead.",
      409,
    );
  }

  const authId = staff.appUser?.authId;

  await prisma.$transaction(async (tx) => {
    if (staff.appUser) {
      await tx.appUser.delete({ where: { id: staff.appUser.id } });
    }
    await tx.staff.delete({ where: { id: staffId } });
  });

  if (authId) {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(authId);
    if (error) {
      console.error("Failed to delete auth user for staff", staffId, error.message);
    }
  }
}

export async function getStaffPerformance(
  storeId?: string,
): Promise<StaffPerformanceRow[]> {
  const where: Prisma.StaffWhereInput = { isActive: true };
  if (storeId) where.storeId = storeId;

  const staff = await prisma.staff.findMany({
    where,
    include: {
      store: { select: { name: true } },
      visits: {
        select: {
          purchaseStatus: true,
          transactionAmount: true,
          followUpNeeded: true,
        },
      },
    },
  });

  return staff.map((member) => {
    const visits = member.visits;
    const followUpCount = visits.filter((v) => v.followUpNeeded).length;

    return {
      staffId: member.id,
      staffName: member.name,
      storeId: member.storeId,
      storeName: member.store.name,
      visits: visits.length,
      revenue: calculateTotalRevenue(visits),
      conversionRate: calculateConversionRate(visits),
      followUpRate:
        visits.length > 0
          ? Math.round((followUpCount / visits.length) * 1000) / 10
          : 0,
    };
  });
}

export async function getStaffById(staffId: string, storeId?: string) {
  return prisma.staff.findFirst({
    where: {
      id: staffId,
      ...(storeId ? { storeId } : {}),
    },
    include: {
      store: { select: { name: true } },
      visits: {
        orderBy: { visitDate: "desc" },
        take: 10,
      },
    },
  });
}

export function enrichStaffWithMetrics(
  visits: Array<{
    purchaseStatus: import("@prisma/client").PurchaseStatus;
    transactionAmount: number | null;
  }>,
) {
  return {
    revenue: calculateTotalRevenue(visits),
    conversionRate: calculateConversionRate(visits),
    avgTransaction: calculateAvgTransaction(visits),
  };
}
