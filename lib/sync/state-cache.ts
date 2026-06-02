import type { AppSession } from "@/types";

const SYNC_STATE_TTL_MS = 15_000;

interface CacheEntry {
  expiresAt: number;
  payload: {
    version: string;
    lastChangedAt: string;
    scope: string;
    counts: Record<string, number>;
  };
}

const cache = new Map<string, CacheEntry>();

function cacheKey(session: AppSession): string {
  const storeId =
    session.role === "STAFF" || session.role === "STORE_MANAGER"
      ? session.storeId
      : "all";
  const staffId = session.role === "STAFF" ? session.staffId : "";
  return `${session.role}:${storeId}:${staffId}`;
}

export function getCachedSyncState(session: AppSession): CacheEntry["payload"] | null {
  const entry = cache.get(cacheKey(session));
  if (!entry || entry.expiresAt <= Date.now()) {
    if (entry) cache.delete(cacheKey(session));
    return null;
  }
  return entry.payload;
}

export function setCachedSyncState(
  session: AppSession,
  payload: CacheEntry["payload"],
): void {
  cache.set(cacheKey(session), {
    expiresAt: Date.now() + SYNC_STATE_TTL_MS,
    payload,
  });
}
