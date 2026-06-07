import { describe, expect, it } from "vitest";
import {
  resolveEffectiveRole,
  shouldPromoteToBusinessOwner,
} from "@/lib/auth/resolve-effective-role";

describe("resolveEffectiveRole", () => {
  it("promotes owner logins without staffId to BUSINESS_OWNER", () => {
    expect(resolveEffectiveRole("STORE_MANAGER", null)).toBe("BUSINESS_OWNER");
    expect(resolveEffectiveRole("STORE_MANAGER", undefined)).toBe("BUSINESS_OWNER");
  });

  it("keeps per-store managers as STORE_MANAGER when staffId is set", () => {
    expect(resolveEffectiveRole("STORE_MANAGER", "staff-123")).toBe("STORE_MANAGER");
  });

  it("passes through other roles unchanged", () => {
    expect(resolveEffectiveRole("BUSINESS_OWNER", null)).toBe("BUSINESS_OWNER");
    expect(resolveEffectiveRole("STAFF", "staff-123")).toBe("STAFF");
    expect(resolveEffectiveRole("MASTER_ADMIN", null)).toBe("MASTER_ADMIN");
  });
});

describe("shouldPromoteToBusinessOwner", () => {
  it("is true only for STORE_MANAGER without staffId", () => {
    expect(shouldPromoteToBusinessOwner("STORE_MANAGER", null)).toBe(true);
    expect(shouldPromoteToBusinessOwner("STORE_MANAGER", "staff-1")).toBe(false);
    expect(shouldPromoteToBusinessOwner("BUSINESS_OWNER", null)).toBe(false);
  });
});
