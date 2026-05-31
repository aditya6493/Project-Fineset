import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildStaticDevSession,
  createDevSessionForEmail,
  inferDevRole,
  isDevAuthBypassEnabled,
  parseDevSessionCookie,
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
      expect(inferDevRole("manager@store-alpha.local")).toBe("STORE_MANAGER");
      expect(inferDevRole("staff-a@store-alpha.local")).toBe("STAFF");
    });

    it("falls back to DEV_AUTH_ROLE then MASTER_ADMIN", () => {
      vi.stubEnv("DEV_AUTH_ROLE", "STAFF");
      expect(inferDevRole("anyone@example.com")).toBe("STAFF");

      vi.unstubAllEnvs();
      expect(inferDevRole("anyone@example.com")).toBe("MASTER_ADMIN");
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
      expect(buildStaticDevSession("manager@store-alpha.local", "STORE_MANAGER").role).toBe(
        "STORE_MANAGER",
      );
      expect(buildStaticDevSession("admin@fineset.local", "MASTER_ADMIN").role).toBe(
        "MASTER_ADMIN",
      );
    });

    it("createDevSessionForEmail always returns a session", async () => {
      const session = await createDevSessionForEmail("staff-a@store-alpha.local");
      expect(session.role).toBe("STAFF");
      expect(session.email).toBe("staff-a@store-alpha.local");
    });
  });
});
