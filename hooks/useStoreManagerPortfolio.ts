import { useQuery } from "@tanstack/react-query";
import { getStoreManagerPortfolio } from "@/lib/api/analytics";
import { analyticsParamsMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import {
  normalizeStoreManagerPortfolio,
  portfolioHasStoreManagerFields,
} from "@/lib/utils/normalize-store-performance";
import type { GetAnalyticsParams, StoreManagerPortfolio } from "@/types";

const PORTFOLIO_QUERY_KEY = "v4";

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

  const canHydrate =
    Boolean(normalizedInitial) &&
    portfolioHasStoreManagerFields(normalizedInitial!);

  return useQuery({
    queryKey: ["analytics", "store", "portfolio", PORTFOLIO_QUERY_KEY, params],
    queryFn: async () =>
      normalizeStoreManagerPortfolio(await getStoreManagerPortfolio(params)),
    initialData: canHydrate ? normalizedInitial : undefined,
    ...LIVE_QUERY_OPTIONS,
    refetchOnMount: "always",
  });
}
