import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardOverview,
  getAdminStoreDetailAnalytics,
  getAdminStoreRsoPerformance,
  getStoreAnalytics,
} from "@/lib/api/analytics";
import { LIVE_QUERY_OPTIONS, SYNC_POLL_INTERVAL_MS } from "@/lib/sync/constants";
import type { GetAnalyticsParams } from "@/types";

const liveDashboardOptions = {
  ...LIVE_QUERY_OPTIONS,
  refetchInterval: SYNC_POLL_INTERVAL_MS,
  refetchIntervalInBackground: true,
};

export function useStoreAnalytics(params: GetAnalyticsParams = {}) {
  return useQuery({
    queryKey: ["analytics", "store", params],
    queryFn: () => getStoreAnalytics(params),
    ...liveDashboardOptions,
  });
}

export function useAdminDashboardOverview(params: GetAnalyticsParams = {}) {
  return useQuery({
    queryKey: ["analytics", "admin", "overview", params],
    queryFn: () => getAdminDashboardOverview(params),
    ...liveDashboardOptions,
  });
}

export function useAdminStoreDetailAnalytics(
  storeId: string,
  params: GetAnalyticsParams = {},
) {
  return useQuery({
    queryKey: ["analytics", "admin", "store", storeId, params],
    queryFn: () => getAdminStoreDetailAnalytics(storeId, params),
    enabled: Boolean(storeId),
    ...liveDashboardOptions,
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
    ...liveDashboardOptions,
  });
}

/** @deprecated Use useAdminDashboardOverview */
export function useAdminAnalytics(params: GetAnalyticsParams = {}) {
  return useAdminDashboardOverview(params);
}
