import { useQuery } from "@tanstack/react-query";
import { getPortalCalls } from "@/lib/api/calls";
import { portalCallsParamsMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import type { GetPortalCallsParams, PortalCallListResponse } from "@/types";

interface UsePortalCallsOptions {
  initialData?: PortalCallListResponse;
  initialParams?: GetPortalCallsParams;
}

export function usePortalCalls(
  params: GetPortalCallsParams = {},
  options?: UsePortalCallsOptions,
) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    portalCallsParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["portal-calls", params],
    queryFn: () => getPortalCalls(params),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
  });
}
