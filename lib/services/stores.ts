import { InviteError, inviteUser } from "@/lib/auth/invite-user";
import { prisma } from "@/lib/db/prisma";
import type { CreateStoreInput, UpdateStoreInput } from "@/lib/validations/store.schema";
import type { Store } from "@prisma/client";
import type { AnalyticsPeriodLabel, StorePerformanceRow } from "@/types";
import type { Prisma, PurchaseStatus } from "@prisma/client";
import {
  calculateConversionRate,
  calculateDelta,
  calculateTotalRevenue,
  getPeriodRange,
  getPreviousPeriodRange,
} from "@/lib/utils/analytics";

export async function listStores(params: {
  page: number;
  pageSize: number;
  search?: string;
  activeOnly?: boolean;
  period?: AnalyticsPeriodLabel;
}) {
  const period = params.period ?? "month";
  const { start, end } = getPeriodRange(period);
  const where: Prisma.StoreWhereInput = {};

  if (params.activeOnly) {
    where.isActive = true;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { city: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Run sequentially to avoid pool saturation on low connection limits.
  const stores = await prisma.store.findMany({
    where,
    orderBy: { name: "asc" },
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
    include: {
      _count: { select: { staff: true } },
      visits: {
        where: { visitDate: { gte: start, lte: end } },
        select: { purchaseStatus: true, transactionAmount: true },
      },
    },
  });
  const total = await prisma.store.count({ where });

  const mapped = stores.map((store) => ({
      id: store.id,
      name: store.name,
      category: store.category,
      customCategory: store.customCategory,
      city: store.city,
      state: store.state,
      pincode: store.pincode,
      pocName: store.pocName,
      pointOfContactPhone: store.pointOfContactPhone,
      email: store.email,
      isActive: store.isActive,
      staffCount: store._count.staff,
      visits: store.visits.length,
      revenue: calculateTotalRevenue(store.visits),
      conversionRate: calculateConversionRate(store.visits),
      createdAt: store.createdAt.toISOString(),
    }));

  return {
    data: mapped,
    total,
  };
}

export type CreateStoreResult = {
  store: Store;
  manager: {
    email: string;
    appUserId: string;
  };
};

export async function createStore(input: CreateStoreInput): Promise<CreateStoreResult> {
  const normalizedCustomCategory =
    input.category === "OTHER" ? input.customCategory?.trim() : undefined;
  const managerEmail = input.email.trim().toLowerCase();
  const managerName = input.pocName?.trim() || input.name.trim();

  const store = await prisma.store.create({
    data: {
      name: input.name.trim(),
      category: input.category,
      customCategory: normalizedCustomCategory,
      city: input.city.trim(),
      state: input.state.trim(),
      pincode: input.pincode,
      pocName: input.pocName,
      pointOfContactPhone: input.pointOfContactPhone,
      email: managerEmail,
    },
  });

  try {
    if (normalizedCustomCategory) {
      await prisma.storeCategoryOption.upsert({
        where: { name: normalizedCustomCategory },
        update: {},
        create: { name: normalizedCustomCategory },
      });
    }

    const manager = await inviteUser({
      name: managerName,
      email: managerEmail,
      password: input.managerPassword,
      role: "STORE_MANAGER",
      storeId: store.id,
    });

    return {
      store,
      manager: {
        email: manager.email,
        appUserId: manager.appUserId,
      },
    };
  } catch (error) {
    await prisma.store.delete({ where: { id: store.id } }).catch(() => undefined);
    if (error instanceof InviteError) {
      throw error;
    }
    throw error;
  }
}

export async function updateStore(storeId: string, input: UpdateStoreInput) {
  const normalizedCustomCategory =
    input.category === "OTHER" ? input.customCategory?.trim() : undefined;
  const shouldClearCustomCategory = input.category && input.category !== "OTHER";

  const store = await prisma.store.update({
    where: { id: storeId },
    data: {
      ...input,
      customCategory: shouldClearCustomCategory ? null : normalizedCustomCategory,
    },
  });

  if (normalizedCustomCategory) {
    await prisma.storeCategoryOption.upsert({
      where: { name: normalizedCustomCategory },
      update: {},
      create: { name: normalizedCustomCategory },
    });
  }

  return store;
}

export async function deleteStore(storeId: string) {
  return prisma.store.delete({
    where: { id: storeId },
  });
}

export async function getStoreById(storeId: string) {
  return prisma.store.findUnique({
    where: { id: storeId },
    include: {
      _count: { select: { staff: true, visits: true, customers: true } },
    },
  });
}

export async function getStorePerformanceRows(
  period: AnalyticsPeriodLabel,
): Promise<StorePerformanceRow[]> {
  const { start, end } = getPeriodRange(period);
  const previousRange = getPreviousPeriodRange(period);

  // Run sequentially to avoid pool saturation on low connection limits.
  const stores = await prisma.store.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { staff: { where: { isActive: true } } } },
      visits: {
        where: { visitDate: { gte: start, lte: end } },
        select: { purchaseStatus: true, transactionAmount: true },
      },
    },
  });
  const previousPeriodVisits = await prisma.visit.findMany({
    where: {
      visitDate: { gte: previousRange.start, lte: previousRange.end },
    },
    select: {
      storeId: true,
      purchaseStatus: true,
      transactionAmount: true,
    },
  });

  const previousByStore = new Map<
    string,
    Array<{ purchaseStatus: PurchaseStatus; transactionAmount: number | null }>
  >();
  for (const visit of previousPeriodVisits) {
    const bucket = previousByStore.get(visit.storeId) ?? [];
    bucket.push(visit);
    previousByStore.set(visit.storeId, bucket);
  }

  const previousVisitsMap = new Map<string, number>();
  const previousRevenueMap = new Map<string, number>();
  const previousConversionMap = new Map<string, number>();

  for (const [storeId, prevVisits] of previousByStore) {
    previousVisitsMap.set(storeId, prevVisits.length);
    previousRevenueMap.set(storeId, calculateTotalRevenue(prevVisits));
    previousConversionMap.set(storeId, calculateConversionRate(prevVisits));
  }

  return stores.map((store) => {
    const visits = store.visits.length;
    const revenue = calculateTotalRevenue(store.visits);
    const conversionRate = calculateConversionRate(store.visits);
    const previousVisits = previousVisitsMap.get(store.id) ?? 0;
    const previousRevenue = previousRevenueMap.get(store.id) ?? 0;
    const previousConversion = previousConversionMap.get(store.id) ?? 0;

    return {
      storeId: store.id,
      storeName: store.name,
      category: store.category,
      city: store.city,
      state: store.state,
      isActive: store.isActive,
      visits,
      revenue,
      conversionRate,
      staffCount: store._count.staff,
      deltas: {
        visits: calculateDelta(visits, previousVisits),
        revenue: calculateDelta(revenue, previousRevenue),
        conversionRate: calculateDelta(conversionRate, previousConversion),
      },
    };
  });
}

/** @deprecated Use getStorePerformanceRows instead */
export async function getStoreRankings(period: AnalyticsPeriodLabel = "month") {
  return getStorePerformanceRows(period);
}
