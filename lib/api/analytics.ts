import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { StoreOverviewBundle } from "@/lib/services/store-overview-bundle";
import type {
  AdminDashboardOverview,
  AnalyticsData,
  GetAnalyticsParams,
  StoreCallAnalytics,
  StoreDetailAnalytics,
  StoreFieldSaleAnalytics,
  StoreManagerPortfolio,
  StoreRsoPerformance,
} from "@/types";

export type StoreOverviewApiResponse = StoreOverviewBundle & {
  period: string;
  storeId: string;
};

export async function getStoreManagerPortfolio(
  params: GetAnalyticsParams = {},
): Promise<StoreManagerPortfolio> {
  const qs = buildQueryString(params);
  return apiFetch<StoreManagerPortfolio>(`/api/analytics/store/portfolio${qs}`);
}

export async function getStoreOverviewBundle(
  params: GetAnalyticsParams = {},
): Promise<StoreOverviewApiResponse> {
  const qs = buildQueryString(params);
  return apiFetch<StoreOverviewApiResponse>(`/api/analytics/store/overview${qs}`);
}

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

export async function getStoreCallAnalytics(
  params: GetAnalyticsParams = {},
): Promise<StoreCallAnalytics> {
  const qs = buildQueryString(params);
  return apiFetch<StoreCallAnalytics>(`/api/analytics/store/calls${qs}`);
}

export async function getStoreFieldSaleAnalytics(
  params: GetAnalyticsParams = {},
): Promise<StoreFieldSaleAnalytics> {
  const qs = buildQueryString(params);
  return apiFetch<StoreFieldSaleAnalytics>(`/api/analytics/store/field-sales${qs}`);
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

