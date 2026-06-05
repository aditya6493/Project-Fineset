import { describe, expect, it } from "vitest";
import {
  LIVE_QUERY_OPTIONS,
  SSE_INVALIDATION_DEBOUNCE_MS,
  SSE_RECONNECT_MAX_MS,
  STAFF_FILTER_QUERY_OPTIONS,
} from "@/lib/sync/constants";

describe("sync constants performance", () => {
  it("disables refetchOnWindowFocus for live queries", () => {
    expect(LIVE_QUERY_OPTIONS.refetchOnWindowFocus).toBe(false);
  });

  it("uses 120s staleTime for staff filter dropdowns", () => {
    expect(STAFF_FILTER_QUERY_OPTIONS.staleTime).toBe(120_000);
  });

  it("debounces SSE invalidation at 750ms", () => {
    expect(SSE_INVALIDATION_DEBOUNCE_MS).toBe(750);
  });

  it("caps SSE reconnect backoff", () => {
    expect(SSE_RECONNECT_MAX_MS).toBe(30_000);
  });
});
