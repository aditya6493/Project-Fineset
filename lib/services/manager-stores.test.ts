import { describe, expect, it } from "vitest";
import {
  normalizeManagerEmail,
  resolveAccessibleStoreId,
} from "@/lib/services/manager-stores";
import type { BusinessOwnerSession, StoreSession } from "@/types";

describe("normalizeManagerEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeManagerEmail("  Manager@Store.EXAMPLE  ")).toBe(
      "manager@store.example",
    );
  });
});

describe("resolveAccessibleStoreId", () => {
  const managerSession: StoreSession = {
    role: "STORE_MANAGER",
    userId: "mgr-1",
    email: "manager@test.local",
    storeId: "store-a",
    storeName: "Store A",
  };

  it("STORE_MANAGER always returns assigned storeId", async () => {
    await expect(resolveAccessibleStoreId(managerSession)).resolves.toBe("store-a");
  });

  it("STORE_MANAGER rejects a foreign storeId", async () => {
    await expect(
      resolveAccessibleStoreId(managerSession, "store-b"),
    ).rejects.toThrow("STORE_ACCESS_DENIED");
  });
});

describe.skipIf(!process.env.DATABASE_URL)("resolveAccessibleStoreId (database)", () => {
  const ownerSession: BusinessOwnerSession = {
    role: "BUSINESS_OWNER",
    userId: "owner-1",
    email: "owner@test.local",
    storeId: "store-a",
    storeName: "Store A",
  };

  it("BUSINESS_OWNER falls back to primary store when no stores are linked", async () => {
    await expect(resolveAccessibleStoreId(ownerSession)).resolves.toBe("store-a");
  });
});
