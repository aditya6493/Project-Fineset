import { cache } from "react";
import { getServerSession, requireRole } from "@/lib/auth/session";
import { listPortalCalls } from "@/lib/services/portal-calls";
import { defaultPortalCallsParams } from "@/lib/query/initial-data";
import type { GetPortalCallsParams, PortalCallListResponse } from "@/types";

export interface InitialPortalCallsPayload {
  params: GetPortalCallsParams;
  data: PortalCallListResponse;
}

export const fetchInitialPortalCalls = cache(async function fetchInitialPortalCalls(
  storeId?: string,
  overrides?: GetPortalCallsParams,
): Promise<InitialPortalCallsPayload | null> {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
    return null;
  }

  let resolvedStoreId = storeId;
  if (session.role === "STORE_MANAGER") {
    resolvedStoreId = session.storeId;
  }

  const params: GetPortalCallsParams = {
    ...defaultPortalCallsParams(resolvedStoreId),
    ...overrides,
    storeId: resolvedStoreId ?? overrides?.storeId,
  };
  const data = await listPortalCalls({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 15,
    year: params.year ?? new Date().getFullYear(),
    month: params.month ?? new Date().getMonth() + 1,
    segment: params.segment ?? "ALL",
    valueTier: params.valueTier ?? "ALL",
    queue: params.queue ?? "ALL",
    storeId: params.storeId,
    staffId: params.staffId,
    search: params.search,
    intentTier: params.intentTier,
  });

  return { params, data };
});
