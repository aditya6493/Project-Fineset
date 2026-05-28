"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  SSE_MAX_CONSECUTIVE_ERRORS,
  SSE_RECONNECT_BASE_MS,
  SSE_RECONNECT_MAX_MS,
} from "@/lib/sync/constants";
import { invalidateEntities } from "@/lib/sync/invalidate-portal-data";
import type { SyncEntity, SyncVersionPayload } from "@/lib/sync/version";

/**
 * Subscribes to SSE sync events and invalidates targeted React Query caches
 * when another session changes shared records.
 */
export function useRealtimeSync(): void {
  const queryClient = useQueryClient();
  const lastVersionRef = useRef<string | null>(null);
  const retryDelayRef = useRef(SSE_RECONNECT_BASE_MS);
  const consecutiveErrorsRef = useRef(0);

  useEffect(() => {
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    function connect(): void {
      if (disposed) return;

      source = new EventSource("/api/sync/events");

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SyncVersionPayload;

          if (
            lastVersionRef.current !== null &&
            lastVersionRef.current !== data.version
          ) {
            void invalidateEntities(
              queryClient,
              data.entities.length > 0
                ? data.entities
                : (["visits", "fieldSales", "staff", "callLogs", "stores"] as SyncEntity[]),
            );
          }

          lastVersionRef.current = data.version;
          retryDelayRef.current = SSE_RECONNECT_BASE_MS;
          consecutiveErrorsRef.current = 0;
        } catch {
          // ignore malformed events
        }
      };

      source.onerror = () => {
        source?.close();
        source = null;

        if (disposed) return;

        consecutiveErrorsRef.current += 1;
        if (consecutiveErrorsRef.current >= SSE_MAX_CONSECUTIVE_ERRORS) {
          // Prevent infinite reconnect loops on persistent 401/network failures.
          return;
        }

        const delay = retryDelayRef.current;
        retryDelayRef.current = Math.min(
          delay * 2,
          SSE_RECONNECT_MAX_MS,
        );

        retryTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      source?.close();
    };
  }, [queryClient]);
}
