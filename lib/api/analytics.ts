import { apiFetch, buildQueryString } from "@/lib/api/client";
import type {
  AdminDashboardOverview,
  AnalyticsData,
  GetAnalyticsParams,
  StoreDetailAnalytics,
  StoreRsoPerformance,
} from "@/types";

export async function getStoreAnalytics(
  params: GetAnalyticsParams = {},
): Promise<AnalyticsData> {
  const qs = buildQueryString(params);
  return apiFetch<AnalyticsData>(`/api/analytics/store${qs}`);
}

export async function getAdminDashboardOverview(
  params: GetAnalyticsParams = {},
): Promise<AdminDashboardOverview> {
  const qs = buildQueryString(params);
  return apiFetch<AdminDashboardOverview>(`/api/analytics/admin${qs}`);
}

export async function getAdminStoreDetailAnalytics(
  storeId: string,
  params: GetAnalyticsParams = {},
): Promise<StoreDetailAnalytics> {
  const qs = buildQueryString(params);
  return apiFetch<StoreDetailAnalytics>(
    `/api/analytics/admin/stores/${storeId}${qs}`,
  );
}

export async function getStoreRsoPerformance(
  params: GetAnalyticsParams = {},
): Promise<StoreRsoPerformance> {
  const qs = buildQueryString(params);
  return apiFetch<StoreRsoPerformance>(`/api/analytics/store/rso-performance${qs}`);
}

export async function getAdminStoreRsoPerformance(
  storeId: string,
  params: GetAnalyticsParams = {},
): Promise<StoreRsoPerformance> {
  const qs = buildQueryString(params);
  return apiFetch<StoreRsoPerformance>(
    `/api/analytics/admin/stores/${storeId}/rso-performance${qs}`,
  );
}

/** @deprecated Use getAdminDashboardOverview */
export async function getAdminAnalytics(
  params: GetAnalyticsParams = {},
): Promise<AdminDashboardOverview> {
  return getAdminDashboardOverview(params);
}
