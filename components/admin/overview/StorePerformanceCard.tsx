import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { getStoreCategoryLabel } from "@/lib/utils/store-category";
import { cn } from "@/lib/utils";
import type { Content } from "@/content/en";
import type { StorePerformanceRow } from "@/types";

type AdminContent = Content["admin"];

export function MetricItem({
  label,
  value,
  delta,
  deltaPeriod,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaPeriod?: string;
}) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 font-medium text-text-primary">{value}</p>
      {delta !== undefined && deltaPeriod && (
        <p
          className={cn(
            "mt-0.5 text-xs",
            delta >= 0 ? "text-status-success" : "text-status-error",
          )}
        >
          {delta >= 0 ? "+" : ""}
          {delta}% {deltaPeriod}
        </p>
      )}
    </div>
  );
}

export function StorePerformanceCard({
  store,
  admin,
}: {
  store: StorePerformanceRow;
  admin: AdminContent;
}) {
  return (
    <Link
      href={`/admin/dashboard/stores/${store.storeId}`}
      className="group block rounded-card border border-border bg-surface-card shadow-card transition hover:border-brand-gold/40 hover:shadow-md"
    >
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-semibold text-text-primary group-hover:text-brand-gold">
              {store.storeName}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  store.isActive
                    ? "bg-status-success/10 text-status-success"
                    : "bg-surface-secondary text-text-muted",
                )}
              >
                {store.isActive ? admin.table.active : admin.table.inactive}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-text-secondary">
                {getStoreCategoryLabel(store.category)}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-1 text-sm text-text-muted">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {store.city}, {store.state}
            </p>
          </div>
          <ArrowRight
            className="mt-1 h-4 w-4 shrink-0 text-text-muted transition group-hover:text-brand-gold"
            aria-hidden
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 py-4 sm:px-5">
        <MetricItem
          label={admin.kpis.totalVisits}
          value={String(store.visits)}
          delta={store.deltas?.visits}
          deltaPeriod={admin.deltaPeriod}
        />
        <MetricItem
          label={admin.kpis.totalRevenue}
          value={formatCurrency(store.revenue)}
          delta={store.deltas?.revenue}
          deltaPeriod={admin.deltaPeriod}
        />
        <MetricItem
          label={admin.kpis.conversionRate}
          value={formatPercent(store.conversionRate)}
          delta={store.deltas?.conversionRate}
          deltaPeriod={admin.deltaPeriod}
        />
        <MetricItem label={admin.kpis.totalStaff} value={String(store.staffCount)} />
      </div>

      <div className="border-t border-border px-4 py-3 sm:px-5">
        <span className="text-sm font-medium text-brand-gold">
          {admin.overview.viewDetails}
        </span>
      </div>
    </Link>
  );
}
