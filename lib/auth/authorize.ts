import type { AppSession } from "@/types";

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function assertStoreAccess(
  session: AppSession,
  storeId: string,
): void {
  if (session.role === "MASTER_ADMIN") return;
  if (
    (session.role === "STORE_MANAGER" || session.role === "STAFF") &&
    session.storeId === storeId
  ) {
    return;
  }
  throw new AuthorizationError("Forbidden store access");
}

export function getScopedStoreId(
  session: AppSession,
  requestedStoreId?: string | null,
): string | null {
  if (session.role === "MASTER_ADMIN") {
    return requestedStoreId ?? null;
  }
  if (session.role === "STORE_MANAGER" || session.role === "STAFF") {
    return session.storeId;
  }
  return null;
}

export function requireScopedStoreId(
  session: AppSession,
  requestedStoreId?: string | null,
): string {
  const storeId = getScopedStoreId(session, requestedStoreId);
  if (!storeId) {
    throw new AuthorizationError("Store context is required");
  }
  return storeId;
}
