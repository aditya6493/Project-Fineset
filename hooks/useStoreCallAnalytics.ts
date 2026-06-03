import { useQuery } from "@tanstack/react-query";
import { getStoreCallAnalytics } from "@/lib/api/analytics";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { GetAnalyticsParams } from "@/types";

export function useStoreCallAnalytics(params: GetAnalyticsParams = {}) {
  return useQuery({
    queryKey: ["analytics", "store", "calls", params],
    queryFn: () => getStoreCallAnalytics(params),
    enabled: Boolean(params.storeId),
    ...LIVE_QUERY_OPTIONS,
  });
}
