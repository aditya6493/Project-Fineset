import { useQuery } from "@tanstack/react-query";
import {
  getAdminBusinessAnalytics,
  getAdminBusinessAnalyticsFilterOptions,
} from "@/lib/api/admin-business-analytics";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { AdminBusinessAnalyticsQuery } from "@/lib/validations/admin-business-analytics.schema";

export function useAdminBusinessAnalyticsFilters() {
  return useQuery({
    queryKey: ["admin-business-analytics-filters"],
    queryFn: getAdminBusinessAnalyticsFilterOptions,
    ...LIVE_QUERY_OPTIONS,
  });
}

export function useAdminBusinessAnalytics(params: AdminBusinessAnalyticsQuery) {
  return useQuery({
    queryKey: ["admin-business-analytics", params],
    queryFn: () => getAdminBusinessAnalytics(params),
    ...LIVE_QUERY_OPTIONS,
  });
}
