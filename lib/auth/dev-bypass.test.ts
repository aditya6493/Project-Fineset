import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db/prisma";
import {
  buildStaticDevSession,
  createDevSessionForEmail,
  inferDevRole,
  isDevAuthBypassEnabled,
  parseDevSessionCookie,
  resetDevSessionCacheForTests,
  serializeDevSessionCookie,
} from "@/lib/auth/dev-bypass";

describe("dev-bypass", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isDevAuthBypassEnabled", () => {
    it("is disabled in production even when flag is set", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("DEV_AUTH_BYPASS", "true");
      expect(isDevAuthBypassEnabled()).toBe(false);
    });

    it("is enabled in development when flag is true", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DEV_AUTH_BYPASS", "true");
      expect(isDevAuthBypassEnabled()).toBe(true);
    });
  });

  describe("inferDevRole", () => {
    beforeEach(() => {
      vi.unstubAllEnvs();
    });

    it("maps known dev emails to roles", () => {
      expect(inferDevRole("admin@fineset.local")).toBe("MASTER_ADMIN");
      expect(inferDevRole("manager@store-alpha.local")).toBe("BUSINESS_OWNER");
      expect(inferDevRole("store-manager@store-alpha.local")).toBe("STORE_MANAGER");
      expect(inferDevRole("staff-a@store-alpha.local")).toBe("STAFF");
    });

    it("maps MASTER_ADMIN_EMAIL from env", () => {
      vi.stubEnv("MASTER_ADMIN_EMAIL", "adityabongu@gmail.com");
      expect(inferDevRole("adityabongu@gmail.com")).toBe("MASTER_ADMIN");
    });

    it("falls back to DEV_AUTH_ROLE and rejects unknown emails", () => {
      vi.stubEnv("DEV_AUTH_ROLE", "STAFF");
      expect(inferDevRole("anyone@example.com")).toBe("STAFF");

      vi.unstubAllEnvs();
      expect(inferDevRole("anyone@example.com")).toBeNull();
    });
  });

  describe("dev session cookie", () => {
    it("round-trips valid session payloads", () => {
      const payload = { email: "admin@fineset.local", role: "MASTER_ADMIN" as const };
      const serialized = serializeDevSessionCookie(payload);
      expect(parseDevSessionCookie(serialized)).toEqual(payload);
    });

    it("rejects invalid cookie payloads", () => {
      expect(parseDevSessionCookie(undefined)).toBeNull();
      expect(parseDevSessionCookie("not-json")).toBeNull();
      expect(parseDevSessionCookie(JSON.stringify({ email: "x", role: "INVALID" }))).toBeNull();
    });
  });

  describe("static dev sessions", () => {
    it("builds all roles without a database", () => {
      expect(buildStaticDevSession("staff-a@store-alpha.local", "STAFF").role).toBe("STAFF");
      expect(buildStaticDevSession("manager@store-alpha.local", "BUSINESS_OWNER").role).toBe(
        "BUSINESS_OWNER",
      );
      expect(buildStaticDevSession("store-manager@store-alpha.local", "STORE_MANAGER").role).toBe(
        "STORE_MANAGER",
      );
      expect(buildStaticDevSession("admin@fineset.local", "MASTER_ADMIN").role).toBe(
        "MASTER_ADMIN",
      );
    });

    it("createDevSessionForEmail returns seeded dev session without database", async () => {
      resetDevSessionCacheForTests();
      vi.spyOn(prisma.staff, "findFirst").mockResolvedValue(null);

      const session = await createDevSessionForEmail("staff-a@store-alpha.local");
      expect(session?.role).toBe("STAFF");
      expect(session?.email).toBe("staff-a@store-alpha.local");
    });

    it("createDevSessionForEmail rejects unknown emails when database is unavailable", async () => {
      const session = await createDevSessionForEmail("unknown-owner@example.com");
      expect(session).toBeNull();
    });
  });
});
