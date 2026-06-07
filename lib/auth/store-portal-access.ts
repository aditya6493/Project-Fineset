import { redirect } from "next/navigation";
import {
  isStoreAllowedForSession,
  isStorePortalSession,
} from "@/lib/services/manager-stores";
import {
  BUSINESS_OWNER_DASHBOARD_PATH,
  storeDetailHrefForRole,
} from "@/lib/utils/store-dashboard-url";
import type { AppSession } from "@/types";

/**
 * Ensures the URL store id is valid for the portal session.
 * Redirects to the correct store detail or portfolio when mismatched.
 */
export async function resolveStoreDetailAccess(
  session: AppSession | null,
  urlStoreId: string,
  period?: string,
): Promise<string> {
  if (!session || !isStorePortalSession(session)) {
    redirect("/");
  }

  if (session.role === "STORE_MANAGER") {
    if (urlStoreId !== session.storeId) {
      redirect(storeDetailHrefForRole(session.storeId, "STORE_MANAGER", period));
    }
    return session.storeId;
  }

  const allowed = await isStoreAllowedForSession(session, urlStoreId);
  if (!allowed) {
    redirect(BUSINESS_OWNER_DASHBOARD_PATH);
  }

  return urlStoreId;
}
