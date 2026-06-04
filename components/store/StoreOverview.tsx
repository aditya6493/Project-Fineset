"use client";

import { useMemo, useState } from "react";
import { useStoreOverviewBundle } from "@/hooks/useStoreOverviewBundle";
import { StoreBusinessOverviewSection } from "@/components/store/StoreBusinessOverview";
import { StoreCallsOverviewSection } from "@/components/store/StoreCallsOverview";
import { StoreFieldSalesOverviewSection } from "@/components/store/StoreFieldSalesOverview";
import { StoreRsoPerformanceSection } from "@/components/store/StoreRsoPerformance";
import { StoreOverviewStoreSelect } from "@/components/store/StoreOverviewStoreSelect";
import { PeriodSwitcher, type PeriodValue } from "@/components/shared/PeriodSwitcher";
import { isStoreKPIs } from "@/lib/utils/type-guards";
import type { StoreOverviewBundle } from "@/lib/services/store-overview-bundle";
import { content, type Content } from "@/content/en";
import type { GetAnalyticsParams, StoreKPIDeltas } from "@/types";

const SELECTED_STORE_STORAGE_KEY = "fineset-manager-selected-store-id";

type StoreContent = Content["store"];

interface StoreOverviewProps {
  store: StoreContent;
  initialStoreId?: string;
  initialOverviewBundle?: StoreOverviewBundle;
  initialOverviewParams?: GetAnalyticsParams;
}

export function StoreOverview({
  store: storeFromPage,
  initialStoreId,
  initialOverviewBundle,
  initialOverviewParams,
}: StoreOverviewProps) {
  const store = { ...content.store, ...storeFromPage };

  const [manualStoreId, setManualStoreId] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodValue>(
    (initialOverviewParams?.period as PeriodValue) ?? "week",
  );

  const resolvedStoreId = useMemo(() => {
    const stores = initialOverviewBundle?.myStores.data ?? [];
    if (stores.length === 0) return initialStoreId ?? "";

    const allowedIds = new Set(stores.map((s) => s.id));
    const fromStorage =
      typeof window !== "undefined"
        ? window.localStorage.getItem(SELECTED_STORE_STORAGE_KEY)
        : null;

    return (
      (manualStoreId && allowedIds.has(manualStoreId) ? manualStoreId : null) ??
      (fromStorage && allowedIds.has(fromStorage) ? fromStorage : null) ??
      (initialStoreId && allowedIds.has(initialStoreId) ? initialStoreId : null) ??
      (initialOverviewBundle?.myStores.selectedStoreId &&
      allowedIds.has(initialOverviewBundle.myStores.selectedStoreId)
        ? initialOverviewBundle.myStores.selectedStoreId
        : null) ??
      stores[0]!.id
    );
  }, [initialOverviewBundle, initialStoreId, manualStoreId]);

  const analyticsParams = useMemo(
    () => ({
      period,
      storeId: resolvedStoreId || undefined,
    }),
    [period, resolvedStoreId],
  );

  const { data: overview, isLoading, isFetching } = useStoreOverviewBundle(
    analyticsParams,
    {
      initialBundle: initialOverviewBundle,
      initialParams: initialOverviewParams,
    },
  );

  const myStores = overview?.myStores ?? initialOverviewBundle?.myStores;
  const stores = myStores?.data ?? [];
  const selectedStoreId = resolvedStoreId;
  const analyticsEnabled = Boolean(selectedStoreId);
  const loading = !analyticsEnabled || isLoading || (isFetching && !overview);

  const handleStoreChange = (storeId: string) => {
    setManualStoreId(storeId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_STORE_STORAGE_KEY, storeId);
    }
  };

  const kpiPayload = overview?.kpis;
  const kpis = kpiPayload && isStoreKPIs(kpiPayload.kpis) ? kpiPayload.kpis : null;
  const deltas = kpiPayload?.kpiDeltas as StoreKPIDeltas | undefined;

  const periodOptions = [
    { value: "today" as const, label: store.period.today },
    { value: "week" as const, label: store.period.week },
    { value: "month" as const, label: store.period.month },
    { value: "last3months" as const, label: store.period.last3months },
    { value: "last6months" as const, label: store.period.last6months },
  ];
  const periodLabel = periodOptions.find((o) => o.value === period)?.label ?? "";

  const bundleHydrated = Boolean(overview);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {store.nav.overview}
          </h1>
          {stores.length > 1 ? (
            <StoreOverviewStoreSelect
              stores={stores}
              value={selectedStoreId}
              onChange={handleStoreChange}
              label={store.storeSelector.label}
              placeholder={store.storeSelector.placeholder}
              loading={!myStores}
            />
          ) : null}
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
        isLoading={loading}
      />

      <StoreCallsOverviewSection
        copy={store.callsOverview}
        period={period}
        periodLabel={periodLabel}
        deltaPeriod={store.deltaPeriod}
        storeId={selectedStoreId}
        initialData={bundleHydrated ? overview?.calls : undefined}
        initialParams={bundleHydrated ? analyticsParams : undefined}
      />

      <StoreFieldSalesOverviewSection
        copy={store.fieldSalesOverview}
        period={period}
        periodLabel={periodLabel}
        deltaPeriod={store.deltaPeriod}
        storeId={selectedStoreId}
        initialData={bundleHydrated ? overview?.fieldSales : undefined}
        initialParams={bundleHydrated ? analyticsParams : undefined}
      />

      <StoreRsoPerformanceSection
        copy={store.rsoPerformance}
        periodLabels={store.period}
        period={period}
        emptyMessage={store.rsoPerformance.empty}
        storeId={selectedStoreId}
        initialData={bundleHydrated ? overview?.rsoPerformance : undefined}
        initialParams={bundleHydrated ? analyticsParams : undefined}
      />
    </div>
  );
}
