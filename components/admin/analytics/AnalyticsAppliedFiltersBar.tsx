"use client";

import type { AnalyticsAppliedFilter } from "@/types/admin-business-analytics";

interface AnalyticsAppliedFiltersBarProps {
  title: string;
  emptyLabel: string;
  periodLabel?: string;
  filters: AnalyticsAppliedFilter[];
}

export function AnalyticsAppliedFiltersBar({
  title,
  emptyLabel,
  periodLabel,
  filters,
}: AnalyticsAppliedFiltersBarProps) {
  return (
    <div className="rounded-card border border-border bg-surface-card px-4 py-3 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{title}</p>
      {periodLabel && (
        <p className="mt-1 text-sm font-medium text-text-primary">{periodLabel}</p>
      )}
      {filters.length === 0 ? (
        <p className="mt-2 text-sm text-text-secondary">{emptyLabel}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <span
              key={`${filter.key}-${filter.value}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-secondary px-2.5 py-1 text-xs"
            >
              <span className="text-text-muted">{filter.label}:</span>
              <span className="font-medium text-text-primary">{filter.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
