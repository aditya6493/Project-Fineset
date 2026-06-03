"use client";

import { useMemo, useState } from "react";
import { useStoreAnalytics } from "@/hooks/useAnalytics";
import { useMyStores } from "@/hooks/useMyStores";
import { StoreBusinessOverviewSection } from "@/components/store/StoreBusinessOverview";
import { StoreCallsOverviewSection } from "@/components/store/StoreCallsOverview";
import { StoreFieldSalesOverviewSection } from "@/components/store/StoreFieldSalesOverview";
import { StoreRsoPerformanceSection } from "@/components/store/StoreRsoPerformance";
import { StoreOverviewStoreSelect } from "@/components/store/StoreOverviewStoreSelect";
import { PeriodSwitcher, type PeriodValue } from "@/components/shared/PeriodSwitcher";
import { isStoreKPIs } from "@/lib/utils/type-guards";
import { content, type Content } from "@/content/en";
import type { StoreKPIDeltas } from "@/types";

const SELECTED_STORE_STORAGE_KEY = "fineset-manager-selected-store-id";

type StoreContent = Content["store"];

interface StoreOverviewProps {
  store: StoreContent;
  initialStoreId?: string;
  initialAnalytics?: import("@/types").AnalyticsData;
  initialAnalyticsParams?: import("@/types").GetAnalyticsParams;
}

export function StoreOverview({
  store: storeFromPage,
  initialStoreId,
  initialAnalytics,
  initialAnalyticsParams,
}: StoreOverviewProps) {
  const store = { ...content.store, ...storeFromPage };

  const { data: myStoresPayload, isLoading: storesLoading } = useMyStores();
  const stores = useMemo(
    () => myStoresPayload?.data ?? [],
    [myStoresPayload?.data],
  );

  const [manualStoreId, setManualStoreId] = useState<string | null>(null);

  const resolvedStoreId = useMemo(() => {
    if (stores.length === 0) return initialStoreId ?? "";

    const allowedIds = new Set(stores.map((s) => s.id));
    const fromStorage =
      typeof window !== "undefined"
        ? window.localStorage.getItem(SELECTED_STORE_STORAGE_KEY)
        : null;

    return (
      (fromStorage && allowedIds.has(fromStorage) ? fromStorage : null) ??
      (initialStoreId && allowedIds.has(initialStoreId) ? initialStoreId : null) ??
      (myStoresPayload?.selectedStoreId &&
      allowedIds.has(myStoresPayload.selectedStoreId)
        ? myStoresPayload.selectedStoreId
        : null) ??
      stores[0]!.id
    );
  }, [stores, initialStoreId, myStoresPayload?.selectedStoreId]);

  const selectedStoreId =
    manualStoreId && stores.some((store) => store.id === manualStoreId)
      ? manualStoreId
      : resolvedStoreId;

  const handleStoreChange = (storeId: string) => {
    setManualStoreId(storeId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_STORE_STORAGE_KEY, storeId);
    }
  };

  const [period, setPeriod] = useState<PeriodValue>("week");

  const analyticsParams = useMemo(
    () => ({
      period,
      storeId: selectedStoreId || undefined,
    }),
    [period, selectedStoreId],
  );

  const analyticsEnabled = Boolean(selectedStoreId);

  const { data, isLoading } = useStoreAnalytics(analyticsParams, {
    initialData: initialAnalytics,
    initialParams: initialAnalyticsParams,
  });

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {store.nav.overview}
          </h1>
          <StoreOverviewStoreSelect
            stores={stores}
            value={selectedStoreId}
            onChange={handleStoreChange}
            label={store.storeSelector.label}
            placeholder={
              storesLoading
                ? store.storeSelector.loading
                : store.storeSelector.placeholder
            }
            loading={storesLoading}
          />
        </div>
        <PeriodSwitcher options={periodOptions} value={period} onChange={setPeriod} />
      </div>

      <StoreBusinessOverviewSection
        copy={store.businessOverview}
        kpiLabels={store.kpis}
        periodLabel={periodLabel}
        deltaPeriod={store.deltaPeriod}
        kpis={kpis}
        deltas={deltas}
        isLoading={!analyticsEnabled || isLoading}
      />

      <StoreCallsOverviewSection
        copy={store.callsOverview}
        period={period}
        periodLabel={periodLabel}
        deltaPeriod={store.deltaPeriod}
        storeId={selectedStoreId}
      />

      <StoreFieldSalesOverviewSection
        copy={store.fieldSalesOverview}
        period={period}
        periodLabel={periodLabel}
        deltaPeriod={store.deltaPeriod}
        storeId={selectedStoreId}
      />

      <StoreRsoPerformanceSection
        copy={store.rsoPerformance}
        periodLabels={store.period}
        period={period}
        emptyMessage={store.rsoPerformance.empty}
        storeId={selectedStoreId}
      />
    </div>
  );
}
