import { forbidden } from "@/lib/auth/session";
import {
  isStorePortalSession,
  resolveAccessibleStoreId,
} from "@/lib/services/manager-stores";
import type { AppSession, StorePortalSession } from "@/types";
import { NextResponse } from "next/server";

export async function resolveStorePortalStoreId(
  session: AppSession,
  requestedStoreId?: string,
): Promise<string | NextResponse> {
  if (!isStorePortalSession(session)) {
    return forbidden();
  }

  try {
    return await resolveAccessibleStoreId(session, requestedStoreId);
  } catch {
    return forbidden();
  }
}

/** @deprecated Use resolveStorePortalStoreId */
export async function resolveStoreManagerAnalyticsStoreId(
  session: StorePortalSession,
  requestedStoreId?: string,
): Promise<string | NextResponse> {
  return resolveStorePortalStoreId(session, requestedStoreId);
}
