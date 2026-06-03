import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardOverview,
  getAdminStoreDetailAnalytics,
  getAdminStoreRsoPerformance,
  getStoreAnalytics,
} from "@/lib/api/analytics";
import { analyticsParamsMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import type {
  AdminDashboardOverview,
  AnalyticsData,
  GetAnalyticsParams,
  StoreDetailAnalytics,
} from "@/types";

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

  return useQuery({
    queryKey: ["analytics", "admin", "overview", params],
    queryFn: () => getAdminDashboardOverview(params),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
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
