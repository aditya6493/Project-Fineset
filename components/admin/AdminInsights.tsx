"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAiInsights, getAdminAnalytics } from "@/lib/api/analytics";
import { KPICard } from "@/components/analytics/KPICard";
import {
  InsightCardList,
  InsightCardListSkeleton,
} from "@/components/analytics/InsightCard";
import { PeriodSwitcher, type PeriodValue } from "@/components/shared/PeriodSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/formatters";
import { isAdminKPIs } from "@/lib/utils/type-guards";
import type { Content } from "@/content/en";

type AdminContent = Content["admin"];

interface AdminInsightsProps {
  admin: AdminContent;
  emptyMessage: string;
}

export function AdminInsights({ admin, emptyMessage }: AdminInsightsProps) {
  const [period, setPeriod] = useState<PeriodValue>("week");

  const periodOptions = [
    { value: "today" as const, label: admin.period.today },
    { value: "week" as const, label: admin.period.week },
    { value: "month" as const, label: admin.period.month },
  ];

  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["analytics", "admin", period],
    queryFn: () => getAdminAnalytics({ period }),
  });

  const {
    data: insights,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ["insights", "admin", period],
    queryFn: () => getAiInsights({ period, context: "admin" }),
  });

  const kpis = analytics && isAdminKPIs(analytics.kpis) ? analytics.kpis : null;

  function handleRefresh() {
    void refetchAnalytics();
    void refetchInsights();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {admin.insights.title}
          </h1>
          <p className="text-text-secondary">{admin.insights.subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PeriodSwitcher options={periodOptions} value={period} onChange={setPeriod} />
          <Button type="button" variant="outline" size="sm" onClick={handleRefresh}>
            {admin.insights.refresh}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          label={admin.kpis.totalRevenue}
          value={kpis ? formatCurrency(kpis.totalRevenue) : formatCurrency(0)}
          isLoading={analyticsLoading}
        />
        <KPICard
          label={admin.kpis.totalVisits}
          value={kpis?.totalVisits ?? 0}
          isLoading={analyticsLoading}
        />
        <KPICard
          label={admin.kpis.conversionRate}
          value={kpis?.conversionRate ?? 0}
          unit="%"
          isLoading={analyticsLoading}
        />
        <KPICard
          label={admin.kpis.activeStores}
          value={kpis?.activeStores ?? 0}
          isLoading={analyticsLoading}
        />
      </div>

      {insightsLoading ? (
        <InsightCardListSkeleton count={4} />
      ) : !insights || insights.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <InsightCardList insights={insights} />
      )}
    </div>
  );
}
