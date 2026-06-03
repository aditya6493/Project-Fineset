import { useQuery } from "@tanstack/react-query";
import { getStoreRsoPerformance } from "@/lib/api/analytics";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { GetAnalyticsParams } from "@/types";

export function useStoreRsoPerformance(params: GetAnalyticsParams = {}) {
  return useQuery({
    queryKey: ["analytics", "store", "rso-performance", params],
    queryFn: () => getStoreRsoPerformance(params),
    enabled: Boolean(params.storeId),
    ...LIVE_QUERY_OPTIONS,
  });
}
