import { describe, expect, it } from "vitest";
import { broadcastSyncEvent, syncBroadcaster } from "@/lib/sync/broadcaster";

describe("sync broadcaster", () => {
  it("notifies subscribers on broadcast", () => {
    const received: string[] = [];
    const unsubscribe = syncBroadcaster.subscribe("store-1", (payload) => {
      received.push(payload.version);
    });

    broadcastSyncEvent("store-1", ["visits"]);
    unsubscribe();

    expect(received.length).toBe(1);
    expect(received[0]).toContain("store-1");
  });
});
