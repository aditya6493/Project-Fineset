"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  IndianRupee,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAdminAnalytics } from "@/hooks/useAnalytics";
import { KPICard } from "@/components/analytics/KPICard";
import {
  RevenueByStoreChart,
  SalesLineChart,
  StoreConversionChart,
} from "@/components/charts";
import { PeriodSwitcher, type PeriodValue } from "@/components/shared/PeriodSwitcher";
import { formatCurrency } from "@/lib/utils/formatters";
import { isAdminKPIs } from "@/lib/utils/type-guards";
import type { Content } from "@/content/en";
import type { AdminKPIDeltas, AdminKPIs, StorePerformanceRow } from "@/types";

type AdminContent = Content["admin"];

interface AdminOverviewProps {
  admin: AdminContent;
}

export function AdminOverview({ admin }: AdminOverviewProps) {
  const [period, setPeriod] = useState<PeriodValue>("week");
  const { data, isLoading } = useAdminAnalytics({ period });

  const kpis = data && isAdminKPIs(data.kpis) ? data.kpis : null;
  const deltas = data?.kpiDeltas as AdminKPIDeltas | undefined;
  const rankings = data?.storeRankings ?? [];

  const periodOptions = [
    { value: "today" as const, label: admin.period.today },
    { value: "week" as const, label: admin.period.week },
    { value: "month" as const, label: admin.period.month },
  ];

  const revenueByStore = rankings.map((store) => ({
    name: store.storeName,
    revenue: store.revenue,
  }));

  const conversionByStore = rankings.map((store) => ({
    name: store.storeName,
    conversionRate: store.conversionRate,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {admin.nav.overview}
        </h1>
        <PeriodSwitcher options={periodOptions} value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
        <KPICard
          label={admin.kpis.totalRevenue}
          value={kpis ? formatCurrency(kpis.totalRevenue) : formatCurrency(0)}
          delta={deltas?.totalRevenue}
          deltaPeriod={admin.deltaPeriod}
          icon={<IndianRupee className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <KPICard
          label={admin.kpis.totalVisits}
          value={kpis?.totalVisits ?? 0}
          delta={deltas?.totalVisits}
          deltaPeriod={admin.deltaPeriod}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <KPICard
          label={admin.kpis.conversionRate}
          value={kpis?.conversionRate ?? 0}
          unit="%"
          delta={deltas?.conversionRate}
          deltaPeriod={admin.deltaPeriod}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <KPICard
          label={admin.kpis.activeStores}
          value={kpis?.activeStores ?? 0}
          icon={<Building2 className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <KPICard
          label={admin.kpis.totalStaff}
          value={kpis?.totalStaff ?? 0}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <StoreRankingTable
        title={admin.ranking.title}
        columns={admin.stores.columns}
        conversionLabel={admin.kpis.conversionRate}
        visitsLabel={admin.kpis.totalVisits}
        data={rankings}
        isLoading={isLoading}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueByStoreChart
          title={admin.charts.revenueByStore}
          data={revenueByStore}
          revenueLabel={admin.kpis.totalRevenue}
        />
        <StoreConversionChart
          title={admin.charts.conversionByStore}
          data={conversionByStore}
          rateLabel={admin.kpis.conversionRate}
        />
        <SalesLineChart
          title={admin.charts.revenueTrend}
          data={data?.visitsByDay ?? []}
          revenueLabel={admin.kpis.totalRevenue}
        />
      </div>
    </div>
  );
}

interface StoreRankingTableProps {
  title: string;
  columns: AdminContent["stores"]["columns"];
  data: StorePerformanceRow[];
  isLoading: boolean;
}

function StoreRankingTable({
  title,
  columns,
  data,
  isLoading,
  conversionLabel,
  visitsLabel,
}: StoreRankingTableProps & { conversionLabel: string; visitsLabel: string }) {
  const [sortKey, setSortKey] = useState<keyof StorePerformanceRow>("revenue");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortKey, sortAsc]);

  function toggleSort(key: keyof StorePerformanceRow) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-card bg-surface-secondary" />;
  }

  return (
    <div className="rounded-card border border-border bg-surface-card shadow-card">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface-secondary">
            <tr>
              <SortHeader label={columns.name} onClick={() => toggleSort("storeName")} />
              <SortHeader label={columns.city} onClick={() => toggleSort("city")} />
              <SortHeader label={visitsLabel} onClick={() => toggleSort("visits")} />
              <SortHeader label={columns.revenueMtd} onClick={() => toggleSort("revenue")} />
              <SortHeader label={conversionLabel} onClick={() => toggleSort("conversionRate")} />
              <SortHeader label={columns.staffCount} onClick={() => toggleSort("staffCount")} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((store) => (
              <tr key={store.storeId} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{store.storeName}</td>
                <td className="px-4 py-3">{store.city}</td>
                <td className="px-4 py-3">{store.visits}</td>
                <td className="px-4 py-3">{formatCurrency(store.revenue)}</td>
                <td className="px-4 py-3">{store.conversionRate.toFixed(1)}%</td>
                <td className="px-4 py-3">{store.staffCount}</td>
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
