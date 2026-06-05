import { useQuery } from "@tanstack/react-query";
import { getStoreFieldSaleAnalytics } from "@/lib/api/analytics";
import { analyticsParamsMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import type { GetAnalyticsParams, StoreFieldSaleAnalytics } from "@/types";

interface UseStoreFieldSaleAnalyticsOptions {
  initialData?: StoreFieldSaleAnalytics;
  initialParams?: GetAnalyticsParams;
}

export function useStoreFieldSaleAnalytics(
  params: GetAnalyticsParams = {},
  options?: UseStoreFieldSaleAnalyticsOptions,
) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    analyticsParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["analytics", "store", "field-sales", params],
    queryFn: () => getStoreFieldSaleAnalytics(params),
    enabled: Boolean(params.storeId),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
  });
}
