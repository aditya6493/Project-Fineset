import { prisma } from "@/lib/db/prisma";
import type { CreateStoreInput, UpdateStoreInput } from "@/lib/validations/store.schema";
import type { AnalyticsPeriodLabel, StorePerformanceRow } from "@/types";
import type { Prisma } from "@prisma/client";
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

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
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
    }),
    prisma.store.count({ where }),
  ]);

  return {
    data: stores.map((store) => ({
      id: store.id,
      name: store.name,
      category: store.category,
      city: store.city,
      state: store.state,
      pincode: store.pincode,
      isActive: store.isActive,
      staffCount: store._count.staff,
      visits: store.visits.length,
      revenue: calculateTotalRevenue(store.visits),
      conversionRate: calculateConversionRate(store.visits),
      createdAt: store.createdAt.toISOString(),
    })),
    total,
  };
}

export async function createStore(input: CreateStoreInput) {
  return prisma.store.create({ data: input });
}

export async function updateStore(storeId: string, input: UpdateStoreInput) {
  return prisma.store.update({
    where: { id: storeId },
    data: input,
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

  const previousVisitsByStore = await prisma.visit.groupBy({
    by: ["storeId"],
    where: {
      visitDate: { gte: previousRange.start, lte: previousRange.end },
    },
    _count: { _all: true },
  });

  const previousRevenueByStore = await prisma.visit.findMany({
    where: {
      visitDate: { gte: previousRange.start, lte: previousRange.end },
    },
    select: {
      storeId: true,
      purchaseStatus: true,
      transactionAmount: true,
    },
  });

  const previousVisitsMap = new Map(
    previousVisitsByStore.map((row) => [row.storeId, row._count._all]),
  );

  const previousRevenueMap = new Map<string, number>();
  const previousConversionMap = new Map<string, number>();

  for (const store of stores) {
    const prevVisits = previousRevenueByStore.filter((v) => v.storeId === store.id);
    previousRevenueMap.set(store.id, calculateTotalRevenue(prevVisits));
    previousConversionMap.set(store.id, calculateConversionRate(prevVisits));
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
