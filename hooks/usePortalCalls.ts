import { useQuery } from "@tanstack/react-query";
import { getPortalCalls } from "@/lib/api/calls";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { GetPortalCallsParams } from "@/types";

export function usePortalCalls(params: GetPortalCallsParams = {}) {
  return useQuery({
    queryKey: ["portal-calls", params],
    queryFn: () => getPortalCalls(params),
    ...LIVE_QUERY_OPTIONS,
  });
}
