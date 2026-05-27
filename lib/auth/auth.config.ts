import type { AppSession } from "@/types";

export function isAppSession(value: unknown): value is AppSession {
  if (!value || typeof value !== "object") return false;
  const role = (value as AppSession).role;
  return role === "STAFF" || role === "STORE_MANAGER" || role === "MASTER_ADMIN";
}

export function getSessionStoreId(session: AppSession): string | null {
  if (session.role === "STAFF" || session.role === "STORE_MANAGER") {
    return session.storeId;
  }
  return null;
}
