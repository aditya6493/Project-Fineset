import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { AnalyticsData, GetAnalyticsParams, InsightCard } from "@/types";

export async function getStoreAnalytics(
  params: GetAnalyticsParams = {},
): Promise<AnalyticsData> {
  const qs = buildQueryString(params);
  return apiFetch<AnalyticsData>(`/api/analytics/store${qs}`);
}

export async function getAdminAnalytics(
  params: GetAnalyticsParams = {},
): Promise<AnalyticsData> {
  const qs = buildQueryString(params);
  return apiFetch<AnalyticsData>(`/api/analytics/admin${qs}`);
}

export async function getAiInsights(params: {
  period?: "today" | "week" | "month";
  storeId?: string;
  context: "store" | "admin";
}): Promise<InsightCard[]> {
  const qs = buildQueryString(params);
  return apiFetch<InsightCard[]>(`/api/ai/insights${qs}`);
}
