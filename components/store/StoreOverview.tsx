"use client";

import { useState } from "react";
import { useStoreAnalytics } from "@/hooks/useAnalytics";
import { StoreBusinessOverviewSection } from "@/components/store/StoreBusinessOverview";
import { StoreCallsOverviewSection } from "@/components/store/StoreCallsOverview";
import { StoreFieldSalesOverviewSection } from "@/components/store/StoreFieldSalesOverview";
import { StoreRsoPerformanceSection } from "@/components/store/StoreRsoPerformance";
import { PeriodSwitcher, type PeriodValue } from "@/components/shared/PeriodSwitcher";
import { isStoreKPIs } from "@/lib/utils/type-guards";
import { content, type Content } from "@/content/en";
import type { StoreKPIDeltas } from "@/types";

type StoreContent = Content["store"];

interface StoreOverviewProps {
  store: StoreContent;
  initialAnalytics?: import("@/types").AnalyticsData;
  initialAnalyticsParams?: import("@/types").GetAnalyticsParams;
}

export function StoreOverview({
  store: storeFromPage,
  initialAnalytics,
  initialAnalyticsParams,
}: StoreOverviewProps) {
  // Merge so new copy keys from content/en.ts are always available even if the
  // RSC payload was built before a content update (avoids undefined copy.title).
  const store = { ...content.store, ...storeFromPage };

  const [period, setPeriod] = useState<PeriodValue>("week");
  const { data, isLoading } = useStoreAnalytics(
    { period },
    { initialData: initialAnalytics, initialParams: initialAnalyticsParams },
  );

  const kpis = data && isStoreKPIs(data.kpis) ? data.kpis : null;
  const deltas = data?.kpiDeltas as StoreKPIDeltas | undefined;

  const periodOptions = [
    { value: "today" as const, label: store.period.today },
    { value: "week" as const, label: store.period.week },
    { value: "month" as const, label: store.period.month },
    { value: "last3months" as const, label: store.period.last3months },
    { value: "last6months" as const, label: store.period.last6months },
  ];
  const periodLabel = periodOptions.find((o) => o.value === period)?.label ?? "";

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {store.nav.overview}
        </h1>
        <PeriodSwitcher options={periodOptions} value={period} onChange={setPeriod} />
      </div>

      <StoreBusinessOverviewSection
        copy={store.businessOverview}
        kpiLabels={store.kpis}
        periodLabel={periodLabel}
        deltaPeriod={store.deltaPeriod}
        kpis={kpis}
        deltas={deltas}
        isLoading={isLoading}
      />

      <StoreCallsOverviewSection
        copy={store.callsOverview}
        period={period}
        periodLabel={periodLabel}
        deltaPeriod={store.deltaPeriod}
      />

      <StoreFieldSalesOverviewSection
        copy={store.fieldSalesOverview}
        period={period}
        periodLabel={periodLabel}
        deltaPeriod={store.deltaPeriod}
      />

      <StoreRsoPerformanceSection
        copy={store.rsoPerformance}
        periodLabels={store.period}
        period={period}
        emptyMessage={store.rsoPerformance.empty}
      />
    </div>
  );
}
