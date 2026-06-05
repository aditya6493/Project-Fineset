import { useQuery } from "@tanstack/react-query";
import { getStoreRsoPerformance } from "@/lib/api/analytics";
import { analyticsParamsMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import type { GetAnalyticsParams, StoreRsoPerformance } from "@/types";

interface UseStoreRsoPerformanceOptions {
  initialData?: StoreRsoPerformance;
  initialParams?: GetAnalyticsParams;
}

export function useStoreRsoPerformance(
  params: GetAnalyticsParams = {},
  options?: UseStoreRsoPerformanceOptions,
) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    analyticsParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["analytics", "store", "rso-performance", params],
    queryFn: () => getStoreRsoPerformance(params),
    enabled: Boolean(params.storeId),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
  });
}
