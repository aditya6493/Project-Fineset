import { prisma } from "@/lib/db/prisma";
import type { AnalyticsData, AdminKPIs, StoreKPIs } from "@/types";
import type { AnalyticsPeriod } from "@/types";
import {
  aggregateVisitsByDay,
  buildStoreKPIs,
  calculateConversionRate,
  calculateDelta,
  calculateTotalRevenue,
  getPeriodRange,
  getPreviousPeriodRange,
} from "@/lib/utils/analytics";
import { getStoreRankings } from "./stores";

export async function getStoreAnalytics(
  storeId: string,
  period: AnalyticsPeriod["label"],
): Promise<AnalyticsData> {
  const { start, end } = getPeriodRange(period);
  const previousRange = getPreviousPeriodRange(period);

  const [visits, previousVisits, openFollowUps] = await Promise.all([
    prisma.visit.findMany({
      where: {
        storeId,
        visitDate: { gte: start, lte: end },
      },
      select: {
        visitDate: true,
        purchaseStatus: true,
        transactionAmount: true,
        customerType: true,
        sourceChannel: true,
        reasonNoPurchase: true,
      },
    }),
    prisma.visit.findMany({
      where: {
        storeId,
        visitDate: { gte: previousRange.start, lte: previousRange.end },
      },
      select: {
        purchaseStatus: true,
        transactionAmount: true,
        customerType: true,
      },
    }),
    prisma.followUp.count({
      where: {
        visit: { storeId },
        status: "OPEN",
      },
    }),
  ]);

  const kpis: StoreKPIs = buildStoreKPIs(visits, openFollowUps);
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

  const sourceMap = new Map<string, number>();
  for (const visit of visits) {
    sourceMap.set(
      visit.sourceChannel,
      (sourceMap.get(visit.sourceChannel) ?? 0) + 1,
    );
  }

  const statusMap = new Map<string, number>();
  for (const visit of visits) {
    statusMap.set(
      visit.purchaseStatus,
      (statusMap.get(visit.purchaseStatus) ?? 0) + 1,
    );
  }

  const reasonMap = new Map<string, number>();
  for (const visit of visits) {
    if (visit.reasonNoPurchase) {
      reasonMap.set(
        visit.reasonNoPurchase,
        (reasonMap.get(visit.reasonNoPurchase) ?? 0) + 1,
      );
    }
  }

  return {
    kpis,
    kpiDeltas,
    visitsByDay: aggregateVisitsByDay(visits),
    sourceBreakdown: Array.from(sourceMap.entries()).map(([channel, count]) => ({
      channel: channel as AnalyticsData["sourceBreakdown"][number]["channel"],
      count,
    })),
    purchaseStatusBreakdown: Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status: status as AnalyticsData["purchaseStatusBreakdown"][number]["status"],
        count,
      }),
    ),
    noPurchaseReasons: Array.from(reasonMap.entries()).map(([reason, count]) => ({
      reason,
      count,
    })),
  };
}

export async function getAdminAnalytics(
  period: AnalyticsPeriod["label"],
): Promise<AnalyticsData> {
  const { start, end } = getPeriodRange(period);
  const previousRange = getPreviousPeriodRange(period);

  const [visits, previousVisits, activeStores, totalStaff] = await Promise.all([
    prisma.visit.findMany({
      where: { visitDate: { gte: start, lte: end } },
      select: {
        visitDate: true,
        purchaseStatus: true,
        transactionAmount: true,
        customerType: true,
        sourceChannel: true,
        reasonNoPurchase: true,
      },
    }),
    prisma.visit.findMany({
      where: {
        visitDate: { gte: previousRange.start, lte: previousRange.end },
      },
      select: {
        purchaseStatus: true,
        transactionAmount: true,
      },
    }),
    prisma.store.count({ where: { isActive: true } }),
    prisma.staff.count({ where: { isActive: true } }),
  ]);

  const kpis: AdminKPIs = {
    totalRevenue: calculateTotalRevenue(visits),
    totalVisits: visits.length,
    conversionRate: calculateConversionRate(visits),
    activeStores,
    totalStaff,
  };

  const previousRevenue = calculateTotalRevenue(previousVisits);
  const previousVisitsCount = previousVisits.length;
  const previousConversion = calculateConversionRate(previousVisits);

  const kpiDeltas = {
    totalRevenue: calculateDelta(kpis.totalRevenue, previousRevenue),
    totalVisits: calculateDelta(kpis.totalVisits, previousVisitsCount),
    conversionRate: calculateDelta(kpis.conversionRate, previousConversion),
  };

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

  const storeRankings = await getStoreRankings();

  return {
    kpis,
    kpiDeltas,
    visitsByDay: aggregateVisitsByDay(visits),
    sourceBreakdown: Array.from(sourceMap.entries()).map(([channel, count]) => ({
      channel: channel as AnalyticsData["sourceBreakdown"][number]["channel"],
      count,
    })),
    purchaseStatusBreakdown: Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status: status as AnalyticsData["purchaseStatusBreakdown"][number]["status"],
        count,
      }),
    ),
    noPurchaseReasons: Array.from(reasonMap.entries()).map(([reason, count]) => ({
      reason,
      count,
    })),
    storeRankings,
  };
}
