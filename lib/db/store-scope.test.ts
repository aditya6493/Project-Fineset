import { describe, expect, it } from "vitest";
import { purgeAtFromNow, STORE_SOFT_DELETE_GRACE_DAYS } from "@/lib/db/store-scope";

describe("store-scope", () => {
  it("purgeAt is 90 days after delete", () => {
    const now = new Date("2026-06-04T12:00:00Z");
    const purgeAt = purgeAtFromNow(now);
    expect(STORE_SOFT_DELETE_GRACE_DAYS).toBe(90);
    expect(purgeAt.getTime() - now.getTime()).toBe(90 * 24 * 60 * 60 * 1000);
  });
});
