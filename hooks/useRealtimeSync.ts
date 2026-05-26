"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSyncState } from "@/lib/api/sync";
import { SYNC_POLL_INTERVAL_MS } from "@/lib/sync/constants";
import { invalidatePortalData } from "@/lib/sync/invalidate-portal-data";

/**
 * Polls backend sync state and refetches all portal data when another
 * session (staff / store / admin) changes shared records.
 */
export function useRealtimeSync(): void {
  const queryClient = useQueryClient();
  const lastVersionRef = useRef<string | null>(null);

  const { data } = useQuery({
    queryKey: ["sync", "state"],
    queryFn: getSyncState,
    refetchInterval: SYNC_POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: 1,
  });

  useEffect(() => {
    if (!data) return;

    if (lastVersionRef.current !== null && lastVersionRef.current !== data.version) {
      void invalidatePortalData(queryClient);
    }

    lastVersionRef.current = data.version;
  }, [data, queryClient]);
}
