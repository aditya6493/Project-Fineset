import type { SyncEntity, SyncVersionPayload } from "@/lib/sync/version";

export type SyncListener = (payload: SyncVersionPayload) => void;

interface SyncEvent {
  scope: string;
  entities: SyncEntity[];
  timestamp: number;
}

/**
 * In-memory pub/sub for SSE sync events.
 * For multi-instance deployments, replace with Redis pub/sub (UPSTASH_REDIS_*).
 */
class SyncBroadcaster {
  private listeners = new Map<string, Set<SyncListener>>();

  subscribe(scope: string, listener: SyncListener): () => void {
    const key = scope;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  broadcast(event: SyncEvent): void {
    const payload: SyncVersionPayload = {
      version: `${event.scope}:${event.timestamp}:${event.entities.sort().join(",")}`,
      scope: event.scope,
      entities: event.entities,
      lastChangedAt: new Date(event.timestamp).toISOString(),
    };

    const scopes = [event.scope, "all"];
    for (const scope of scopes) {
      for (const listener of this.listeners.get(scope) ?? []) {
        listener(payload);
      }
    }
  }
}

export const syncBroadcaster = new SyncBroadcaster();

export function broadcastSyncEvent(
  storeId: string | null,
  entities: SyncEntity[],
): void {
  syncBroadcaster.broadcast({
    scope: storeId ?? "all",
    entities,
    timestamp: Date.now(),
  });
}
