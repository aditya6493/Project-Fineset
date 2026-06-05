import type { StoreManagerPortfolio, StorePerformanceRow } from "@/types";

/** Fills metrics added after first deploy so stale SSR/cache rows never render "undefined". */
export function normalizeStorePerformanceRow(
  row: StorePerformanceRow,
): StorePerformanceRow {
  return {
    ...row,
    pocName: row.pocName ?? null,
    pointOfContactPhone: row.pointOfContactPhone ?? null,
    fieldSales: row.fieldSales ?? 0,
    userCalls: row.userCalls ?? 0,
    deltas: row.deltas
      ? {
          visits: row.deltas.visits ?? 0,
          revenue: row.deltas.revenue ?? 0,
          conversionRate: row.deltas.conversionRate ?? 0,
          fieldSales: row.deltas.fieldSales ?? 0,
          userCalls: row.deltas.userCalls ?? 0,
        }
      : undefined,
  };
}

export function normalizeStoreManagerPortfolio(
  portfolio: StoreManagerPortfolio,
): StoreManagerPortfolio {
  return {
    ...portfolio,
    stores: portfolio.stores.map(normalizeStorePerformanceRow),
  };
}
