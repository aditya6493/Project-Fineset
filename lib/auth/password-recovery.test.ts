import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import {
  isPasswordRecoveryFlowPending,
  isPasswordRecoveryRedirect,
  isRecoverySessionUser,
} from "@/lib/auth/password-recovery";

describe("password-recovery helpers", () => {
  it("detects reset-password redirect targets", () => {
    expect(isPasswordRecoveryRedirect("/reset-password", null)).toBe(true);
    expect(isPasswordRecoveryRedirect(null, "recovery")).toBe(true);
    expect(isPasswordRecoveryRedirect("/admin/dashboard", null)).toBe(false);
  });

  it("detects recovery sessions from amr", () => {
    const user = {
      amr: [{ method: "recovery", timestamp: 1 }],
    } as unknown as User;

    expect(isRecoverySessionUser(user)).toBe(true);
    expect(
      isRecoverySessionUser({
        amr: [{ method: "password", timestamp: 1 }],
      } as unknown as User),
    ).toBe(false);
  });

  it("reads pending recovery cookie", () => {
    expect(
      isPasswordRecoveryFlowPending({
        get: (name) => (name === "fineset_password_recovery" ? { value: "1" } : undefined),
      }),
    ).toBe(true);
    expect(
      isPasswordRecoveryFlowPending({
        get: () => undefined,
      }),
    ).toBe(false);
  });
});
