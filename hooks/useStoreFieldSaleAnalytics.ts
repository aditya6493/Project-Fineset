import { useQuery } from "@tanstack/react-query";
import { getStoreFieldSaleAnalytics } from "@/lib/api/analytics";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { GetAnalyticsParams } from "@/types";

export function useStoreFieldSaleAnalytics(params: GetAnalyticsParams = {}) {
  return useQuery({
    queryKey: ["analytics", "store", "field-sales", params],
    queryFn: () => getStoreFieldSaleAnalytics(params),
    enabled: Boolean(params.storeId),
    ...LIVE_QUERY_OPTIONS,
  });
}
