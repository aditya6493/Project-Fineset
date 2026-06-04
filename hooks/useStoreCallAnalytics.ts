import { useQuery } from "@tanstack/react-query";
import { getStoreCallAnalytics } from "@/lib/api/analytics";
import { analyticsParamsMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import type { GetAnalyticsParams, StoreCallAnalytics } from "@/types";

interface UseStoreCallAnalyticsOptions {
  initialData?: StoreCallAnalytics;
  initialParams?: GetAnalyticsParams;
}

export function useStoreCallAnalytics(
  params: GetAnalyticsParams = {},
  options?: UseStoreCallAnalyticsOptions,
) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    analyticsParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["analytics", "store", "calls", params],
    queryFn: () => getStoreCallAnalytics(params),
    enabled: Boolean(params.storeId),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
  });
}
