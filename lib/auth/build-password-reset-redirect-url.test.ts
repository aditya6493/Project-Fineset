import { describe, expect, it } from "vitest";
import { buildPasswordResetRedirectUrl } from "@/lib/auth/build-password-reset-redirect-url";
import { parsePasswordResetClientError } from "@/lib/auth/parse-password-reset-error";

describe("buildPasswordResetRedirectUrl", () => {
  it("builds encoded callback url", () => {
    expect(buildPasswordResetRedirectUrl("https://mystore.tribly.ai")).toBe(
      "https://mystore.tribly.ai/auth/callback?next=%2Freset-password",
    );
  });
});

describe("parsePasswordResetClientError", () => {
  it("detects rate limit errors", () => {
    expect(parsePasswordResetClientError("Email rate limit exceeded")).toBe("rate_limited");
  });

  it("detects redirect errors", () => {
    expect(parsePasswordResetClientError("redirect_to url is not allowed")).toBe(
      "redirect_not_allowed",
    );
  });
});
