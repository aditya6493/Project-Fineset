import { useQuery } from "@tanstack/react-query";
import { getStoreManagerPortfolio } from "@/lib/api/analytics";
import { analyticsParamsMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import { normalizeStoreManagerPortfolio } from "@/lib/utils/normalize-store-performance";
import type { GetAnalyticsParams, StoreManagerPortfolio } from "@/types";

const PORTFOLIO_QUERY_KEY = "v2";

interface UseStoreManagerPortfolioOptions {
  initialData?: StoreManagerPortfolio;
  initialParams?: GetAnalyticsParams;
}

export function useStoreManagerPortfolio(
  params: GetAnalyticsParams = {},
  options?: UseStoreManagerPortfolioOptions,
) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    analyticsParamsMatch(params, options.initialParams);

  const normalizedInitial = useInitialData
    ? normalizeStoreManagerPortfolio(options!.initialData!)
    : undefined;

  return useQuery({
    queryKey: ["analytics", "store", "portfolio", PORTFOLIO_QUERY_KEY, params],
    queryFn: async () =>
      normalizeStoreManagerPortfolio(await getStoreManagerPortfolio(params)),
    initialData: normalizedInitial,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
  });
}
