import type { PurchaseStatus } from "@prisma/client";
import type { AnalyticsPeriod, StoreKPIs } from "@/types";

export function getPeriodRange(
  period: AnalyticsPeriod["label"],
  referenceDate: Date = new Date(),
): { start: Date; end: Date } {
  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  if (period === "today") {
    return { start, end };
  }

  if (period === "week") {
    start.setDate(start.getDate() - 6);
    return { start, end };
  }

  start.setDate(1);
  return { start, end };
}

export function getPreviousPeriodRange(
  period: AnalyticsPeriod["label"],
  referenceDate: Date = new Date(),
): { start: Date; end: Date } {
  const current = getPeriodRange(period, referenceDate);

  if (period === "today") {
    const start = new Date(current.start);
    start.setDate(start.getDate() - 1);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (period === "week") {
    const end = new Date(current.start);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  const start = new Date(current.start);
  start.setMonth(start.getMonth() - 1);
  const end = new Date(current.start);
  end.setMilliseconds(-1);
  return { start, end };
}

export function calculateConversionRate(
  visits: Array<{ purchaseStatus: PurchaseStatus }>,
): number {
  if (visits.length === 0) return 0;
  const purchased = visits.filter((v) => v.purchaseStatus === "PURCHASED").length;
  return Math.round((purchased / visits.length) * 1000) / 10;
}

export function calculateAvgTransaction(
  visits: Array<{ purchaseStatus: PurchaseStatus; transactionAmount: number | null }>,
): number {
  const purchased = visits.filter(
    (v) => v.purchaseStatus === "PURCHASED" && v.transactionAmount !== null,
  );
  if (purchased.length === 0) return 0;
  const total = purchased.reduce((sum, v) => sum + (v.transactionAmount ?? 0), 0);
  return Math.round(total / purchased.length);
}

export function calculateTotalRevenue(
  visits: Array<{ purchaseStatus: PurchaseStatus; transactionAmount: number | null }>,
): number {
  return visits
    .filter((v) => v.purchaseStatus === "PURCHASED")
    .reduce((sum, v) => sum + (v.transactionAmount ?? 0), 0);
}

export function calculateDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function buildStoreKPIs(
  visits: Array<{
    purchaseStatus: PurchaseStatus;
    transactionAmount: number | null;
    customerType: string;
  }>,
  openFollowUps: number,
): StoreKPIs {
  return {
    totalVisits: visits.length,
    totalRevenue: calculateTotalRevenue(visits),
    conversionRate: calculateConversionRate(visits),
    avgTransaction: calculateAvgTransaction(visits),
    newCustomers: visits.filter((v) => v.customerType === "NEW").length,
    repeatCustomers: visits.filter((v) => v.customerType === "REPEAT").length,
    openFollowUps,
  };
}

export function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function aggregateVisitsByDay(
  visits: Array<{
    visitDate: Date;
    purchaseStatus: PurchaseStatus;
    transactionAmount: number | null;
  }>,
): Array<{ date: string; visits: number; revenue: number }> {
  const map = new Map<string, { visits: number; revenue: number }>();

  for (const visit of visits) {
    const key = formatDateKey(visit.visitDate);
    const existing = map.get(key) ?? { visits: 0, revenue: 0 };
    existing.visits += 1;
    if (visit.purchaseStatus === "PURCHASED") {
      existing.revenue += visit.transactionAmount ?? 0;
    }
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({ date, ...stats }));
}
