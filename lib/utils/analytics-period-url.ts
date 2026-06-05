import type { PeriodValue } from "@/components/shared/PeriodSwitcher";
import type { AnalyticsPeriodLabel } from "@/types";

export const PERIOD_VALUES = [
  "today",
  "week",
  "month",
  "last3months",
  "last6months",
] as const satisfies readonly AnalyticsPeriodLabel[];

export function isPeriodValue(value: string | null | undefined): value is PeriodValue {
  return (
    value !== null &&
    value !== undefined &&
    PERIOD_VALUES.includes(value as AnalyticsPeriodLabel)
  );
}

export function parsePeriodParam(value?: string | null): PeriodValue {
  if (isPeriodValue(value)) return value;
  return "week";
}
