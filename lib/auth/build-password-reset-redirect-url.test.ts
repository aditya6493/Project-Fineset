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
  it("detects rate limit errors from message text", () => {
    expect(parsePasswordResetClientError("Email rate limit exceeded")).toBe("rate_limited");
  });

  it("detects rate limit errors from Supabase error code", () => {
    expect(
      parsePasswordResetClientError({
        code: "over_email_send_rate_limit",
        message: "email rate limit exceeded",
        status: 429,
      }),
    ).toBe("rate_limited");
  });

  it("detects rate limit errors from HTTP 429 status", () => {
    expect(
      parsePasswordResetClientError({
        status: 429,
        message: "Too many requests",
      }),
    ).toBe("rate_limited");
  });

  it("detects redirect errors", () => {
    expect(parsePasswordResetClientError("redirect_to url is not allowed")).toBe(
      "redirect_not_allowed",
    );
  });

  it("returns failed for unknown errors", () => {
    expect(parsePasswordResetClientError({ message: "Something else went wrong" })).toBe(
      "failed",
    );
  });
});
