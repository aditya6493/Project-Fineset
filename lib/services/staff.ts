import { prisma } from "@/lib/db/prisma";
import { buildAppMetadata } from "@/lib/auth/activate-profile";
import { inviteUser } from "@/lib/auth/invite-user";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/validations/staff.schema";
import type { Prisma, PurchaseStatus } from "@prisma/client";
import type { StaffPerformanceRow } from "@/types";
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

export class StaffUpdateError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "StaffUpdateError";
  }
}

export async function listStaff(storeId: string) {
  const [staff, visitMetrics] = await Promise.all([
    prisma.staff.findMany({
      where: { storeId },
      orderBy: { name: "asc" },
      include: {
        appUser: {
          select: {
            email: true,
          },
        },
        _count: {
          select: {
            visits: true,
            fieldSales: true,
            assignedFollowUps: true,
          },
        },
      },
    }),
    prisma.visit.findMany({
      where: { storeId },
      select: {
        staffId: true,
        purchaseStatus: true,
        transactionAmount: true,
      },
    }),
  ]);

  const visitsByStaff = new Map<
    string,
    Array<{ purchaseStatus: PurchaseStatus; transactionAmount: number | null }>
  >();
  for (const visit of visitMetrics) {
    const list = visitsByStaff.get(visit.staffId) ?? [];
    list.push({
      purchaseStatus: visit.purchaseStatus,
      transactionAmount: visit.transactionAmount,
    });
    visitsByStaff.set(visit.staffId, list);
  }

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
    const visits = visitsByStaff.get(member.id) ?? [];
    const visitCount = member._count.visits;
    const hasActivity =
      visitCount > 0 ||
      member._count.fieldSales > 0 ||
      member._count.assignedFollowUps > 0;

    return {
      id: member.id,
      name: member.name,
      employeeId: member.employeeId,
      phone: member.phone,
      role: member.role,
      email: member.appUser?.email ?? null,
      createdAt: member.createdAt,
      isActive: member.isActive,
      visitCount,
      canDelete: !hasActivity,
      monthlyVisits: visitCount,
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
    role: input.role,
    storeId,
    employeeId: input.employeeId,
    phone: input.phone,
  });
}

export async function updateStaff(
  staffId: string,
  storeId: string,
  input: UpdateStaffInput,
) {
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, storeId },
    include: {
      appUser: true,
      store: { select: { name: true } },
    },
  });

  if (!staff) {
    return { count: 0 };
  }

  if (input.employeeId && input.employeeId !== staff.employeeId) {
    const duplicateEmployee = await prisma.staff.findUnique({
      where: { employeeId: input.employeeId },
    });
    if (duplicateEmployee && duplicateEmployee.id !== staffId) {
      throw new StaffUpdateError("Employee ID already exists", 409);
    }
  }

  const normalizedEmail = input.email?.trim().toLowerCase();
  if (normalizedEmail && staff.appUser && normalizedEmail !== staff.appUser.email) {
    const duplicateEmail = await prisma.appUser.findUnique({
      where: { email: normalizedEmail },
    });
    if (duplicateEmail && duplicateEmail.id !== staff.appUser.id) {
      throw new StaffUpdateError("This email is already in use", 409);
    }
  }

  const staffData: Prisma.StaffUpdateInput = {};
  if (input.name !== undefined) {
    staffData.name = input.name.trim();
  }
  if (input.employeeId !== undefined) {
    staffData.employeeId = input.employeeId;
  }
  if (input.phone !== undefined) {
    staffData.phone = input.phone;
  }
  if (input.role !== undefined) {
    staffData.role = input.role;
  }
  if (input.isActive !== undefined) {
    staffData.isActive = input.isActive;
  }

  if (Object.keys(staffData).length > 0) {
    await prisma.staff.update({
      where: { id: staffId },
      data: staffData,
    });
  }

  const appUserNeedsUpdate =
    staff.appUser &&
    (input.name !== undefined || normalizedEmail || input.role !== undefined);

  if (appUserNeedsUpdate && staff.appUser) {
    const appUserData: Prisma.AppUserUpdateInput = {};
    if (input.name !== undefined) {
      appUserData.name = input.name.trim();
    }
    if (normalizedEmail) {
      appUserData.email = normalizedEmail;
    }
    if (input.role !== undefined) {
      appUserData.role = input.role;
    }
    await prisma.appUser.update({
      where: { id: staff.appUser.id },
      data: appUserData,
    });
  }

  const shouldSyncAuth =
    staff.appUser?.authId &&
    (appUserNeedsUpdate ||
      input.employeeId !== undefined ||
      input.phone !== undefined ||
      input.isActive !== undefined);

  if (shouldSyncAuth && staff.appUser?.authId) {
    const profile = await prisma.appUser.findUnique({
      where: { id: staff.appUser.id },
      include: {
        store: { select: { name: true } },
        staff: { select: { employeeId: true } },
      },
    });

    if (profile) {
      const supabase = createAdminClient();
      const authUpdates: {
        email?: string;
        app_metadata?: ReturnType<typeof buildAppMetadata>;
      } = {
        app_metadata: buildAppMetadata(profile),
      };
      if (normalizedEmail && normalizedEmail !== staff.appUser.email) {
        authUpdates.email = normalizedEmail;
      }

      const { error } = await supabase.auth.admin.updateUserById(
        staff.appUser.authId,
        authUpdates,
      );
      if (error) {
        throw new StaffUpdateError(
          error.message ?? "Failed to update staff login",
          502,
        );
      }
    }
  }

  return { count: 1 };
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
