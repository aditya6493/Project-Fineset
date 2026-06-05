import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { getStoreCategoryLabel } from "@/lib/utils/store-category";
import { cn } from "@/lib/utils";
import type { Content } from "@/content/en";
import type { StorePerformanceRow } from "@/types";

type AdminContent = Content["admin"];

export interface StorePerformanceCardLabels {
  totalVisits: string;
  totalRevenue: string;
  conversionRate: string;
  totalStaff: string;
  fieldSales: string;
  userCalls: string;
  pocName: string;
  pocPhone: string;
  notAvailable: string;
  active: string;
  inactive: string;
  viewDetails: string;
  deltaPeriod: string;
}

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

function ContactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-sm text-text-primary" title={value}>
        {value}
      </dd>
    </div>
  );
}

function displayContactValue(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function StorePerformanceCard({
  store,
  admin,
  detailHref,
  labels,
  className,
}: {
  store: StorePerformanceRow;
  admin?: AdminContent;
  detailHref?: string;
  labels?: StorePerformanceCardLabels;
  className?: string;
}) {
  const href =
    detailHref ?? `/admin/dashboard/stores/${store.storeId}`;
  const cardLabels: StorePerformanceCardLabels = labels ?? {
    totalVisits: admin!.kpis.totalVisits,
    totalRevenue: admin!.kpis.totalRevenue,
    conversionRate: admin!.kpis.conversionRate,
    totalStaff: admin!.kpis.totalStaff,
    fieldSales: admin!.kpis.fieldSales,
    userCalls: admin!.kpis.userCalls,
    pocName: admin!.kpis.pocName,
    pocPhone: admin!.kpis.pocPhone,
    notAvailable: admin!.kpis.notAvailable,
    active: admin!.table.active,
    inactive: admin!.table.inactive,
    viewDetails: admin!.overview.viewDetails,
    deltaPeriod: admin!.deltaPeriod,
  };

  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "group block rounded-card border border-border bg-surface-card shadow-card transition hover:border-brand-gold/40 hover:shadow-md",
        className,
      )}
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
                {store.isActive ? cardLabels.active : cardLabels.inactive}
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

      <div className="grid grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-3 sm:px-5">
        <MetricItem
          label={cardLabels.totalVisits}
          value={String(store.visits)}
          delta={store.deltas?.visits}
          deltaPeriod={cardLabels.deltaPeriod}
        />
        <MetricItem
          label={cardLabels.totalRevenue}
          value={formatCurrency(store.revenue)}
          delta={store.deltas?.revenue}
          deltaPeriod={cardLabels.deltaPeriod}
        />
        <MetricItem
          label={cardLabels.conversionRate}
          value={formatPercent(store.conversionRate)}
          delta={store.deltas?.conversionRate}
          deltaPeriod={cardLabels.deltaPeriod}
        />
        <MetricItem
          label={cardLabels.fieldSales}
          value={String(store.fieldSales ?? 0)}
          delta={store.deltas?.fieldSales}
          deltaPeriod={cardLabels.deltaPeriod}
        />
        <MetricItem
          label={cardLabels.userCalls}
          value={String(store.userCalls ?? 0)}
          delta={store.deltas?.userCalls}
          deltaPeriod={cardLabels.deltaPeriod}
        />
        <MetricItem label={cardLabels.totalStaff} value={String(store.staffCount)} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border px-4 py-4 sm:px-5">
        <ContactItem
          label={cardLabels.pocName}
          value={displayContactValue(store.pocName, cardLabels.notAvailable)}
        />
        <ContactItem
          label={cardLabels.pocPhone}
          value={displayContactValue(
            store.pointOfContactPhone,
            cardLabels.notAvailable,
          )}
        />
      </dl>

      <div className="border-t border-border px-4 py-3 sm:px-5">
        <span className="text-sm font-medium text-brand-gold">
          {cardLabels.viewDetails}
        </span>
      </div>
    </Link>
  );
}
