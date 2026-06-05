/** Shared React Query options for live backend-backed data. */
export const LIVE_QUERY_OPTIONS = {
  staleTime: 30_000,
  // Refetch-on-focus caused duplicate API bursts on store tabs (calls/field-sales/staff).
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  // Avoid retry storms when backend returns 500 (shows as repeated calls in Network tab).
  retry: false,
} as const;

/** Staff filter dropdowns — share cache across portal tabs, refetch less often. */
export const STAFF_FILTER_QUERY_OPTIONS = {
  ...LIVE_QUERY_OPTIONS,
  staleTime: 120_000,
} as const;

/** Avoid duplicate client fetch right after matching SSR initialData. */
export const SSR_HYDRATED_QUERY_OPTIONS = {
  refetchOnMount: false,
  staleTime: 60_000,
} as const;

export function queryOptionsForHydration(isHydrated: boolean) {
  return isHydrated ? SSR_HYDRATED_QUERY_OPTIONS : {};
}

/** Coalesce rapid SSE entity invalidations before refetching React Query caches. */
export const SSE_INVALIDATION_DEBOUNCE_MS = 750;

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
