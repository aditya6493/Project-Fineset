import { describe, expect, it } from "vitest";
import { generateSecurePassword } from "@/lib/auth/generate-password";
import { validatePassword } from "@/lib/auth/password-policy";

describe("generateSecurePassword", () => {
  it("returns a password that passes policy validation", () => {
    for (let i = 0; i < 20; i += 1) {
      const password = generateSecurePassword();
      expect(validatePassword(password).success).toBe(true);
    }
  });

  it("respects minimum length", () => {
    expect(generateSecurePassword(20)).toHaveLength(20);
  });
});
