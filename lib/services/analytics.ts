import { mergeStoreWhere, storeNotDeletedWhere } from "@/lib/db/store-scope";
import { prisma } from "@/lib/db/prisma";
import type {
  AdminDashboardOverview,
  AnalyticsData,
  StoreDetailAnalytics,
  StoreManagerPortfolio,
} from "@/types";
import type { AnalyticsPeriod } from "@/types";
import type { PurchaseStatus, SourceChannel } from "@prisma/client";
import {
  aggregateVisitsByDay,
  buildStoreKPIs,
  calculateConversionRate,
  calculateDelta,
  calculateTotalRevenue,
  getPeriodRange,
  getPreviousPeriodRange,
} from "@/lib/utils/analytics";
import { getManagerStorePerformanceRows, getStorePerformanceRows } from "./stores";

const visitAnalyticsSelect = {
  visitDate: true,
  purchaseStatus: true,
  transactionAmount: true,
  customerType: true,
  sourceChannel: true,
  reasonNoPurchase: true,
} as const;

function buildVisitBreakdowns(
  visits: Array<{
    sourceChannel: SourceChannel;
    purchaseStatus: PurchaseStatus;
    reasonNoPurchase: string | null;
  }>,
) {
  const sourceMap = new Map<string, number>();
  const statusMap = new Map<string, number>();
  const reasonMap = new Map<string, number>();

  for (const visit of visits) {
    sourceMap.set(
      visit.sourceChannel,
      (sourceMap.get(visit.sourceChannel) ?? 0) + 1,
    );
    statusMap.set(
      visit.purchaseStatus,
      (statusMap.get(visit.purchaseStatus) ?? 0) + 1,
    );
    if (visit.reasonNoPurchase) {
      reasonMap.set(
        visit.reasonNoPurchase,
        (reasonMap.get(visit.reasonNoPurchase) ?? 0) + 1,
      );
    }
  }

  return {
    sourceBreakdown: Array.from(sourceMap.entries()).map(([channel, count]) => ({
      channel: channel as SourceChannel,
      count,
    })),
    purchaseStatusBreakdown: Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status: status as PurchaseStatus,
        count,
      }),
    ),
    noPurchaseReasons: Array.from(reasonMap.entries()).map(([reason, count]) => ({
      reason,
      count,
    })),
  };
}

export async function getStoreAnalytics(
  storeId: string,
  period: AnalyticsPeriod["label"],
): Promise<AnalyticsData> {
  const { start, end } = getPeriodRange(period);
  const previousRange = getPreviousPeriodRange(period);

  const visits = await prisma.visit.findMany({
    where: {
      storeId,
      visitDate: { gte: start, lte: end },
    },
    select: {
      purchaseStatus: true,
      transactionAmount: true,
      customerType: true,
    },
  });
  const previousVisits = await prisma.visit.findMany({
    where: {
      storeId,
      visitDate: { gte: previousRange.start, lte: previousRange.end },
    },
    select: {
      purchaseStatus: true,
      transactionAmount: true,
      customerType: true,
    },
  });
  const openFollowUps = await prisma.followUp.count({
    where: {
      visit: { storeId },
      status: "OPEN",
    },
  });

  const kpis = buildStoreKPIs(visits, openFollowUps);
  const previousKpis = buildStoreKPIs(previousVisits, openFollowUps);

  const kpiDeltas = {
    totalVisits: calculateDelta(kpis.totalVisits, previousKpis.totalVisits),
    totalRevenue: calculateDelta(kpis.totalRevenue, previousKpis.totalRevenue),
    conversionRate: calculateDelta(kpis.conversionRate, previousKpis.conversionRate),
    avgTransaction: calculateDelta(kpis.avgTransaction, previousKpis.avgTransaction),
    newCustomers: calculateDelta(kpis.newCustomers, previousKpis.newCustomers),
    repeatCustomers: calculateDelta(
      kpis.repeatCustomers,
      previousKpis.repeatCustomers,
    ),
  };

  return {
    kpis,
    kpiDeltas,
  };
}

export async function getStoreManagerPortfolio(
  email: string,
  primaryStoreId: string,
  period: AnalyticsPeriod["label"],
): Promise<StoreManagerPortfolio> {
  const stores = await getManagerStorePerformanceRows(
    email,
    primaryStoreId,
    period,
  );
  return { period, stores };
}

export async function getAdminDashboardOverview(
  period: AnalyticsPeriod["label"],
): Promise<AdminDashboardOverview> {
  const startedAt = Date.now();
  try {
    const totalStores = await prisma.store.count({ where: storeNotDeletedWhere });
    const activeStores = await prisma.store.count({
      where: mergeStoreWhere({ isActive: true }),
    });
    const stores = await getStorePerformanceRows(period);

    return {
      totalStores,
      activeStores,
      period,
      stores,
    };
  } catch (error) {
    console.error("[services.analytics] getAdminDashboardOverview failed", {
      period,
      elapsedMs: Date.now() - startedAt,
      error,
    });
    throw error;
  }
}

export async function getAdminStoreDetailAnalytics(
  storeId: string,
  period: AnalyticsPeriod["label"],
): Promise<StoreDetailAnalytics> {
  const store = await prisma.store.findFirst({
    where: mergeStoreWhere({ id: storeId }),
    select: {
      id: true,
      name: true,
      category: true,
      city: true,
      state: true,
      isActive: true,
    },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const { start, end } = getPeriodRange(period);
  const previousRange = getPreviousPeriodRange(period);

  const visits = await prisma.visit.findMany({
    where: {
      storeId,
      visitDate: { gte: start, lte: end },
    },
    select: visitAnalyticsSelect,
  });
  const previousVisits = await prisma.visit.findMany({
    where: {
      storeId,
      visitDate: { gte: previousRange.start, lte: previousRange.end },
    },
    select: {
      purchaseStatus: true,
      transactionAmount: true,
      customerType: true,
    },
  });
  const openFollowUps = await prisma.followUp.count({
    where: {
      visit: { storeId },
      status: "OPEN",
    },
  });

  const kpis = buildStoreKPIs(visits, openFollowUps);
  const previousKpis = buildStoreKPIs(previousVisits, openFollowUps);

  const kpiDeltas = {
    totalVisits: calculateDelta(kpis.totalVisits, previousKpis.totalVisits),
    totalRevenue: calculateDelta(kpis.totalRevenue, previousKpis.totalRevenue),
    conversionRate: calculateDelta(kpis.conversionRate, previousKpis.conversionRate),
    avgTransaction: calculateDelta(kpis.avgTransaction, previousKpis.avgTransaction),
    newCustomers: calculateDelta(kpis.newCustomers, previousKpis.newCustomers),
    repeatCustomers: calculateDelta(
      kpis.repeatCustomers,
      previousKpis.repeatCustomers,
    ),
  };

  const breakdowns = buildVisitBreakdowns(visits);

  return {
    store,
    kpis,
    kpiDeltas,
    visitsByDay: aggregateVisitsByDay(visits),
    ...breakdowns,
  };
}

export async function assertStoreExists(storeId: string): Promise<boolean> {
  const count = await prisma.store.count({
    where: mergeStoreWhere({ id: storeId }),
  });
  return count > 0;
}
