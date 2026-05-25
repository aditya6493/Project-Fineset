"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAiInsights, getStoreAnalytics } from "@/lib/api/analytics";
import { KPICard } from "@/components/analytics/KPICard";
import {
  InsightCardList,
  InsightCardListSkeleton,
} from "@/components/analytics/InsightCard";
import { PeriodSwitcher, type PeriodValue } from "@/components/shared/PeriodSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/utils/formatters";
import { isStoreKPIs } from "@/lib/utils/type-guards";
import type { Content } from "@/content/en";

type StoreContent = Content["store"];

interface StoreAnalyticsPageProps {
  store: StoreContent;
  emptyMessage: string;
}

export function StoreAnalyticsPage({ store, emptyMessage }: StoreAnalyticsPageProps) {
  const [period, setPeriod] = useState<PeriodValue>("week");

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics", "store", period],
    queryFn: () => getStoreAnalytics({ period }),
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["insights", "store", period],
    queryFn: () => getAiInsights({ period, context: "store" }),
  });

  const kpis = analytics && isStoreKPIs(analytics.kpis) ? analytics.kpis : null;

  const periodOptions = [
    { value: "today" as const, label: store.period.today },
    { value: "week" as const, label: store.period.week },
    { value: "month" as const, label: store.period.month },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {store.analytics.title}
        </h1>
        <PeriodSwitcher options={periodOptions} value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          label={store.kpis.totalVisits}
          value={kpis?.totalVisits ?? 0}
          isLoading={analyticsLoading}
        />
        <KPICard
          label={store.kpis.totalRevenue}
          value={kpis ? formatCurrency(kpis.totalRevenue) : formatCurrency(0)}
          isLoading={analyticsLoading}
        />
        <KPICard
          label={store.kpis.conversionRate}
          value={kpis?.conversionRate ?? 0}
          unit="%"
          isLoading={analyticsLoading}
        />
        <KPICard
          label={store.kpis.avgTransaction}
          value={kpis ? formatCurrency(kpis.avgTransaction) : formatCurrency(0)}
          isLoading={analyticsLoading}
        />
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {store.analytics.insightsTitle}
        </h2>
        {insightsLoading ? (
          <InsightCardListSkeleton count={4} />
        ) : !insights || insights.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <InsightCardList insights={insights} />
        )}
      </section>
    </div>
  );
}
