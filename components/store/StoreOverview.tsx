"use client";

import { useState } from "react";
import {
  IndianRupee,
  Repeat,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useStoreAnalytics } from "@/hooks/useAnalytics";
import { KPICard } from "@/components/analytics/KPICard";
import {
  ConversionBarChart,
  NoPurchaseReasonsChart,
  PurchaseStatusChart,
  SalesLineChart,
} from "@/components/charts";
import { PeriodSwitcher, type PeriodValue } from "@/components/shared/PeriodSwitcher";
import { formatCurrency } from "@/lib/utils/formatters";
import { isStoreKPIs } from "@/lib/utils/type-guards";
import type { Content } from "@/content/en";
import type { StoreKPIDeltas, StoreKPIs } from "@/types";

type StoreContent = Content["store"];
type VisitFormFields = Content["visitForm"]["fields"];

interface StoreOverviewProps {
  store: StoreContent;
  visitFields: VisitFormFields;
}

export function StoreOverview({ store, visitFields }: StoreOverviewProps) {
  const [period, setPeriod] = useState<PeriodValue>("week");
  const { data, isLoading } = useStoreAnalytics({ period });

  const kpis = data && isStoreKPIs(data.kpis) ? data.kpis : null;
  const deltas = data?.kpiDeltas as StoreKPIDeltas | undefined;

  const periodOptions = [
    { value: "today" as const, label: store.period.today },
    { value: "week" as const, label: store.period.week },
    { value: "month" as const, label: store.period.month },
  ];

  const sourceData =
    data?.sourceBreakdown.map((item) => ({
      name: visitFields.sourceChannel.options[item.channel] ?? item.channel,
      count: item.count,
    })) ?? [];

  const statusData =
    data?.purchaseStatusBreakdown.map((item) => ({
      name: visitFields.purchaseStatus.options[item.status] ?? item.status,
      value: item.count,
    })) ?? [];

  const reasonData =
    data?.noPurchaseReasons.map((item) => ({
      reason:
        visitFields.reasonNoPurchase.options[
          item.reason as keyof typeof visitFields.reasonNoPurchase.options
        ] ?? item.reason,
      count: item.count,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {store.nav.overview}
        </h1>
        <PeriodSwitcher options={periodOptions} value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StoreKpiGrid
          kpis={kpis}
          deltas={deltas}
          labels={store.kpis}
          isLoading={isLoading}
          deltaPeriod={store.deltaPeriod}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SalesLineChart
          title={store.analytics.charts.dailyRevenue}
          data={data?.visitsByDay ?? []}
          revenueLabel={store.kpis.totalRevenue}
        />
        <ConversionBarChart
          title={store.analytics.charts.sourceBreakdown}
          data={sourceData}
          countLabel={store.kpis.totalVisits}
        />
        <PurchaseStatusChart
          title={store.analytics.charts.purchaseStatus}
          data={statusData}
        />
        <NoPurchaseReasonsChart
          title={store.analytics.charts.noPurchaseReasons}
          data={reasonData}
          countLabel={store.kpis.totalVisits}
        />
      </div>
    </div>
  );
}

interface StoreKpiGridProps {
  kpis: StoreKPIs | null;
  deltas?: StoreKPIDeltas;
  labels: StoreContent["kpis"];
  isLoading: boolean;
  deltaPeriod: string;
}

function StoreKpiGrid({
  kpis,
  deltas,
  labels,
  isLoading,
  deltaPeriod,
}: StoreKpiGridProps) {
  return (
    <>
      <KPICard
        label={labels.totalVisits}
        value={kpis?.totalVisits ?? 0}
        delta={deltas?.totalVisits}
        deltaPeriod={deltaPeriod}
        icon={<Users className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.totalRevenue}
        value={kpis ? formatCurrency(kpis.totalRevenue) : formatCurrency(0)}
        delta={deltas?.totalRevenue}
        deltaPeriod={deltaPeriod}
        icon={<IndianRupee className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.conversionRate}
        value={kpis?.conversionRate ?? 0}
        unit="%"
        delta={deltas?.conversionRate}
        deltaPeriod={deltaPeriod}
        icon={<TrendingUp className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.avgTransaction}
        value={kpis ? formatCurrency(kpis.avgTransaction) : formatCurrency(0)}
        delta={deltas?.avgTransaction}
        deltaPeriod={deltaPeriod}
        icon={<ShoppingBag className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.newCustomers}
        value={kpis?.newCustomers ?? 0}
        delta={deltas?.newCustomers}
        deltaPeriod={deltaPeriod}
        icon={<UserPlus className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.repeatCustomers}
        value={kpis?.repeatCustomers ?? 0}
        delta={deltas?.repeatCustomers}
        deltaPeriod={deltaPeriod}
        icon={<Repeat className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.openFollowUps}
        value={kpis?.openFollowUps ?? 0}
        icon={<Users className="h-4 w-4" />}
        isLoading={isLoading}
        className="col-span-2 lg:col-span-1"
      />
    </>
  );
}
