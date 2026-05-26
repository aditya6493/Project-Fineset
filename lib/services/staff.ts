import { prisma } from "@/lib/db/prisma";
import { hashCredential } from "@/lib/auth/credentials";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/validations/staff.schema";
import type { StaffPerformanceRow } from "@/types";
import type { Prisma } from "@prisma/client";
import {
  calculateAvgTransaction,
  calculateConversionRate,
  calculateTotalRevenue,
  getPeriodRange,
} from "@/lib/utils/analytics";

export async function listStaff(storeId: string) {
  const staff = await prisma.staff.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { visits: true } },
    },
  });

  const { start, end } = getPeriodRange("month");

  const performance = await Promise.all(
    staff.map(async (member) => {
      const visits = await prisma.visit.findMany({
        where: {
          staffId: member.id,
          visitDate: { gte: start, lte: end },
        },
        select: {
          purchaseStatus: true,
          transactionAmount: true,
          followUpNeeded: true,
        },
      });

      const followUps = await prisma.followUp.count({
        where: {
          assignedStaffId: member.id,
          status: "OPEN",
        },
      });

      return {
        id: member.id,
        name: member.name,
        employeeId: member.employeeId,
        isActive: member.isActive,
        visitCount: member._count.visits,
        monthlyVisits: visits.length,
        monthlyRevenue: calculateTotalRevenue(visits),
        conversionRate: calculateConversionRate(visits),
        openFollowUps: followUps,
      };
    }),
  );

  return performance;
}

export async function createStaff(storeId: string, input: CreateStaffInput) {
  const passwordHash = await hashCredential(input.employeeId);
  return prisma.staff.create({
    data: {
      name: input.name,
      employeeId: input.employeeId,
      passwordHash,
      storeId,
      role: "STAFF",
    },
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

export async function getStaffPerformance(
  storeId?: string,
): Promise<StaffPerformanceRow[]> {
  const where: Prisma.StaffWhereInput = { isActive: true };
  if (storeId) where.storeId = storeId;

  const { start, end } = getPeriodRange("month");

  const staff = await prisma.staff.findMany({
    where,
    include: {
      store: { select: { name: true } },
      visits: {
        where: { visitDate: { gte: start, lte: end } },
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
