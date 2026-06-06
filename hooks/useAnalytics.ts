import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardOverview,
  getAdminStoreDetailAnalytics,
  getAdminStoreRsoPerformance,
  getStoreAnalytics,
} from "@/lib/api/analytics";
import { analyticsParamsMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import {
  normalizeStorePerformanceRow,
  portfolioHasStoreManagerFields,
} from "@/lib/utils/normalize-store-performance";
import type {
  AdminDashboardOverview,
  AnalyticsData,
  GetAnalyticsParams,
  StoreDetailAnalytics,
  StoreManagerPortfolio,
} from "@/types";

function normalizeAdminOverview(data: AdminDashboardOverview): AdminDashboardOverview {
  return {
    ...data,
    stores: data.stores.map(normalizeStorePerformanceRow),
  };
}

function adminOverviewAsPortfolio(data: AdminDashboardOverview): StoreManagerPortfolio {
  return { period: data.period, stores: data.stores };
}

interface UseAnalyticsOptions<T> {
  initialData?: T;
  initialParams?: GetAnalyticsParams;
  enabled?: boolean;
}

export function useStoreAnalytics(
  params: GetAnalyticsParams = {},
  options?: UseAnalyticsOptions<AnalyticsData>,
) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    analyticsParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["analytics", "store", params],
    queryFn: () => getStoreAnalytics(params),
    enabled: options?.enabled !== false && Boolean(params.storeId),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
  });
}

export function useAdminDashboardOverview(
  params: GetAnalyticsParams = {},
  options?: UseAnalyticsOptions<AdminDashboardOverview>,
) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    analyticsParamsMatch(params, options.initialParams);

  const normalizedInitial = useInitialData
    ? normalizeAdminOverview(options!.initialData!)
    : undefined;

  const canHydrate =
    Boolean(normalizedInitial) &&
    portfolioHasStoreManagerFields(adminOverviewAsPortfolio(normalizedInitial!));

  return useQuery({
    queryKey: ["analytics", "admin", "overview", "v4", params],
    queryFn: async () => normalizeAdminOverview(await getAdminDashboardOverview(params)),
    initialData: canHydrate ? normalizedInitial : undefined,
    ...LIVE_QUERY_OPTIONS,
    refetchOnMount: "always",
  });
}

export function useAdminStoreDetailAnalytics(
  storeId: string,
  params: GetAnalyticsParams = {},
  options?: UseAnalyticsOptions<StoreDetailAnalytics>,
) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    analyticsParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["analytics", "admin", "store", storeId, params],
    queryFn: () => getAdminStoreDetailAnalytics(storeId, params),
    enabled: Boolean(storeId),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
  });
}

export function useAdminStoreRsoPerformance(
  storeId: string,
  params: GetAnalyticsParams = {},
) {
  return useQuery({
    queryKey: ["analytics", "admin", "store", storeId, "rso-performance", params],
    queryFn: () => getAdminStoreRsoPerformance(storeId, params),
    enabled: Boolean(storeId),
    ...LIVE_QUERY_OPTIONS,
  });
}
