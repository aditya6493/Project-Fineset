/** How often open portals poll the backend for data changes (ms). */
export const SYNC_POLL_INTERVAL_MS = 5_000;

/** Shared React Query options for live backend-backed data. */
export const LIVE_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;
