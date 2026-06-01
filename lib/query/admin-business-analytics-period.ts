import type { AdminBusinessAnalyticsQuery } from "@/lib/validations/admin-business-analytics.schema";

export type AnalyticsPeriodMode =
  | "preset"
  | "range"
  | "day"
  | "month"
  | "compare";

export type AnalyticsPeriodSelection =
  | { mode: "preset"; period: NonNullable<AdminBusinessAnalyticsQuery["period"]> }
  | { mode: "range"; startDate: Date; endDate: Date }
  | { mode: "day"; date: Date }
  | { mode: "month"; month: number; year: number }
  | {
      mode: "compare";
      periodA: { month: number; year: number };
      periodB: { month: number; year: number };
    };

export function buildAnalyticsDateQuery(
  selection: AnalyticsPeriodSelection,
): Pick<
  AdminBusinessAnalyticsQuery,
  | "dateMode"
  | "period"
  | "startDate"
  | "endDate"
  | "month"
  | "year"
  | "compareAMonth"
  | "compareAYear"
  | "compareBMonth"
  | "compareBYear"
> {
  switch (selection.mode) {
    case "preset":
      return { dateMode: "preset", period: selection.period };
    case "range":
      return {
        dateMode: "range",
        startDate: selection.startDate,
        endDate: selection.endDate,
      };
    case "day":
      return { dateMode: "day", startDate: selection.date };
    case "month":
      return {
        dateMode: "month",
        month: selection.month,
        year: selection.year,
      };
    case "compare":
      return {
        dateMode: "compare",
        compareAMonth: selection.periodA.month,
        compareAYear: selection.periodA.year,
        compareBMonth: selection.periodB.month,
        compareBYear: selection.periodB.year,
      };
  }
}

export const DEFAULT_COMPARE_PERIOD: AnalyticsPeriodSelection = {
  mode: "compare",
  periodA: { month: 5, year: 2026 },
  periodB: { month: 5, year: 2025 },
};

export const DEFAULT_PERIOD_SELECTION: AnalyticsPeriodSelection = {
  mode: "preset",
  period: "month",
};
