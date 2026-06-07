export const YEAR_LOOKBACK = 10;

export function buildYearOptions(currentYear: number, fromData: number[]): number[] {
  const years = new Set<number>();
  for (let offset = 0; offset < YEAR_LOOKBACK; offset += 1) {
    years.add(currentYear - offset);
  }
  for (const year of fromData) {
    years.add(year);
  }
  return Array.from(years).sort((a, b) => b - a);
}

export function badgeClass(
  kind: "segment" | "value" | "status" | "queue" | "callOutcome",
  value: string,
): string {
  if (kind === "value") {
    if (value === "HIGH") return "bg-brand-gold/10 text-brand-gold";
    if (value === "MID") return "bg-status-warning/10 text-status-warning";
    return "bg-surface-secondary text-text-secondary";
  }

  if (kind === "queue") {
    if (value === "FOLLOW_UP") return "bg-brand-gold/10 text-brand-gold";
    if (value === "NOT_ANSWERED") return "bg-status-error/10 text-status-error";
    return "bg-surface-secondary text-text-secondary";
  }

  if (kind === "callOutcome") {
    if (value === "ANSWERED") return "bg-status-success/10 text-status-success";
    if (value === "NOT_ANSWERED") return "bg-status-error/10 text-status-error";
    return "bg-surface-secondary text-text-muted";
  }

  if (value === "PURCHASED") return "bg-status-success/10 text-status-success";
  if (value === "NOT_PURCHASED") return "bg-status-error/10 text-status-error";
  return "bg-surface-secondary text-text-secondary";
}

export function getCallOutcomeKey(
  lastCallStatus: "ANSWERED" | "NOT_ANSWERED" | null,
): "ANSWERED" | "NOT_ANSWERED" | "NOT_CALLED" {
  if (lastCallStatus === "ANSWERED") return "ANSWERED";
  if (lastCallStatus === "NOT_ANSWERED") return "NOT_ANSWERED";
  return "NOT_CALLED";
}

export function formatLabel(value: string): string {
  return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
