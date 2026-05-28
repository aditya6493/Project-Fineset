/** Shared React Query options for live backend-backed data. */
export const LIVE_QUERY_OPTIONS = {
  staleTime: 30_000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;

/** SSE heartbeat interval (ms). */
export const SSE_HEARTBEAT_MS = 30_000;

/** Close SSE before serverless hard timeout (Vercel ~300s). */
export const SSE_SERVER_MAX_CONNECTION_MS = 240_000;

/** SSE reconnect backoff base (ms). */
export const SSE_RECONNECT_BASE_MS = 1_000;

/** Max SSE reconnect backoff (ms). */
export const SSE_RECONNECT_MAX_MS = 30_000;

/** Stop reconnect loop after repeated failures. */
export const SSE_MAX_CONSECUTIVE_ERRORS = 6;
