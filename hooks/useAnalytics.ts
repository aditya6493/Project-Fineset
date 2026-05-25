import { useQuery } from "@tanstack/react-query";
import { getAdminAnalytics, getStoreAnalytics } from "@/lib/api/analytics";
import type { GetAnalyticsParams } from "@/types";

export function useStoreAnalytics(params: GetAnalyticsParams = {}) {
  return useQuery({
    queryKey: ["analytics", "store", params],
    queryFn: () => getStoreAnalytics(params),
  });
}

export function useAdminAnalytics(params: GetAnalyticsParams = {}) {
  return useQuery({
    queryKey: ["analytics", "admin", params],
    queryFn: () => getAdminAnalytics(params),
  });
}
