"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  MapPin,
  Users,
} from "lucide-react";
import { useAdminDashboardOverview } from "@/hooks/useAnalytics";
import { KPICard } from "@/components/analytics/KPICard";
import { PeriodSwitcher, type PeriodValue } from "@/components/shared/PeriodSwitcher";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { getStoreCategoryLabel } from "@/lib/utils/store-category";
import type { Content } from "@/content/en";
import type { StoreCategory, StorePerformanceRow } from "@/types";
import { cn } from "@/lib/utils";

type AdminContent = Content["admin"];

interface AdminOverviewProps {
  admin: AdminContent;
}

export function AdminOverview({ admin }: AdminOverviewProps) {
  const [period, setPeriod] = useState<PeriodValue>("week");
  const [categoryFilter, setCategoryFilter] = useState<StoreCategory | "ALL">("ALL");
  const { data, isLoading } = useAdminDashboardOverview({ period });

  const periodOptions = [
    { value: "today" as const, label: admin.period.today },
    { value: "week" as const, label: admin.period.week },
    { value: "month" as const, label: admin.period.month },
    { value: "last3months" as const, label: admin.period.last3months },
    { value: "last6months" as const, label: admin.period.last6months },
  ];

  const filteredStores = useMemo(() => {
    const stores = data?.stores ?? [];
    if (categoryFilter === "ALL") return stores;
    return stores.filter((store) => store.category === categoryFilter);
  }, [categoryFilter, data?.stores]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {admin.overview.title}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{admin.overview.subtitle}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={categoryFilter}
            onValueChange={(value) =>
              setCategoryFilter(value as StoreCategory | "ALL")
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={admin.overview.allCategories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{admin.overview.allCategories}</SelectItem>
              {Object.entries(admin.categories).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PeriodSwitcher options={periodOptions} value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 [&>*]:min-w-0">
        <KPICard
          label={admin.overview.totalStores}
          value={data?.totalStores ?? 0}
          icon={<Building2 className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <KPICard
          label={admin.overview.activeStores}
          value={data?.activeStores ?? 0}
          icon={<Building2 className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <KPICard
          label={admin.overview.listedStores}
          value={filteredStores.length}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-card bg-surface-secondary"
            />
          ))}
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="rounded-card border border-border bg-surface-card p-8 text-center shadow-card">
          <p className="text-text-secondary">{admin.overview.emptyStores}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStores.map((store) => (
            <StorePerformanceCard
              key={store.storeId}
              store={store}
              admin={admin}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredStores.length > 0 && (
        <StorePerformanceTable stores={filteredStores} admin={admin} />
      )}
    </div>
  );
}

function StorePerformanceCard({
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
              <MapPin className="h-3.5 w-3.5" />
              {store.city}, {store.state}
            </p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-text-muted transition group-hover:text-brand-gold" />
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
        <MetricItem
          label={admin.kpis.totalStaff}
          value={String(store.staffCount)}
        />
      </div>

      <div className="border-t border-border px-4 py-3 sm:px-5">
        <span className="text-sm font-medium text-brand-gold">
          {admin.overview.viewDetails}
        </span>
      </div>
    </Link>
  );
}

function MetricItem({
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

function StorePerformanceTable({
  stores,
  admin,
}: {
  stores: StorePerformanceRow[];
  admin: AdminContent;
}) {
  const [sortKey, setSortKey] = useState<keyof StorePerformanceRow>("revenue");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...stores].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [sortAsc, sortKey, stores]);

  function toggleSort(key: keyof StorePerformanceRow) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface-card shadow-card">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          {admin.ranking.title}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{admin.overview.tableHint}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-border bg-surface-secondary">
            <tr>
              <SortHeader label={admin.stores.columns.name} onClick={() => toggleSort("storeName")} />
              <SortHeader label={admin.stores.columns.category} onClick={() => toggleSort("category")} />
              <SortHeader label={admin.stores.columns.city} onClick={() => toggleSort("city")} />
              <SortHeader label={admin.kpis.totalVisits} onClick={() => toggleSort("visits")} />
              <SortHeader label={admin.kpis.totalRevenue} onClick={() => toggleSort("revenue")} />
              <SortHeader label={admin.kpis.conversionRate} onClick={() => toggleSort("conversionRate")} />
              <SortHeader label={admin.kpis.totalStaff} onClick={() => toggleSort("staffCount")} />
              <th className="px-4 py-3 font-medium text-text-secondary">{admin.overview.actions}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((store) => (
              <tr key={store.storeId} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{store.storeName}</td>
                <td className="px-4 py-3">{getStoreCategoryLabel(store.category)}</td>
                <td className="px-4 py-3">{store.city}</td>
                <td className="px-4 py-3">{store.visits}</td>
                <td className="px-4 py-3">{formatCurrency(store.revenue)}</td>
                <td className="px-4 py-3">{formatPercent(store.conversionRate)}</td>
                <td className="px-4 py-3">{store.staffCount}</td>
                <td className="px-4 py-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/dashboard/stores/${store.storeId}`}>
                      {admin.overview.viewDetails}
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        className="font-medium text-text-secondary hover:text-brand-gold"
        onClick={onClick}
      >
        {label}
      </button>
    </th>
  );
}
