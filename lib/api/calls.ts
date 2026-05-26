import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { GetPortalCallsParams, PortalCallListResponse } from "@/types";

export async function getPortalCalls(
  params: GetPortalCallsParams = {},
): Promise<PortalCallListResponse> {
  const qs = buildQueryString(params);
  return apiFetch<PortalCallListResponse>(`/api/calls${qs}`);
}
