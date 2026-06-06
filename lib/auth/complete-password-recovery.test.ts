// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  completePasswordRecovery,
  parsePasswordRecoveryUrlParams,
  shouldAttemptPasswordRecovery,
  stripPasswordRecoveryUrlParams,
} from "@/lib/auth/complete-password-recovery";

describe("parsePasswordRecoveryUrlParams", () => {
  it("reads recovery params from search params", () => {
    const params = new URLSearchParams(
      "token_hash=abc&type=recovery&code=xyz&error=auth_callback",
    );

    expect(parsePasswordRecoveryUrlParams(params)).toEqual({
      tokenHash: "abc",
      type: "recovery",
      code: "xyz",
      error: "auth_callback",
    });
  });
});

describe("shouldAttemptPasswordRecovery", () => {
  it("attempts token_hash recovery links", () => {
    expect(
      shouldAttemptPasswordRecovery({
        tokenHash: "hash",
        type: "recovery",
        code: null,
        error: null,
      }),
    ).toBe(true);
  });

  it("attempts PKCE code links", () => {
    expect(
      shouldAttemptPasswordRecovery({
        tokenHash: null,
        type: null,
        code: "pkce-code",
        error: null,
      }),
    ).toBe(true);
  });

  it("skips when error is present", () => {
    expect(
      shouldAttemptPasswordRecovery({
        tokenHash: "hash",
        type: "recovery",
        code: null,
        error: "auth_callback",
      }),
    ).toBe(false);
  });

  it("skips when no recovery params are present", () => {
    expect(
      shouldAttemptPasswordRecovery({
        tokenHash: null,
        type: null,
        code: null,
        error: null,
      }),
    ).toBe(false);
  });
});

describe("stripPasswordRecoveryUrlParams", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("https://mystore.tribly.ai/reset-password?token_hash=abc&type=recovery"),
    });
    window.history.replaceState = vi.fn();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("removes recovery query params from the url", () => {
    stripPasswordRecoveryUrlParams();

    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/reset-password",
    );
  });
});

describe("completePasswordRecovery", () => {
  beforeEach(() => {
    window.history.replaceState = vi.fn();
  });

  it("verifies token_hash recovery links", async () => {
    const verifyOtp = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      auth: { verifyOtp, exchangeCodeForSession: vi.fn() },
    };

    const result = await completePasswordRecovery(supabase as never, {
      tokenHash: "hash-value",
      type: "recovery",
      code: null,
      error: null,
    });

    expect(result).toEqual({ ok: true });
    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: "hash-value",
      type: "recovery",
    });
  });

  it("exchanges PKCE codes in the browser", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      auth: { verifyOtp: vi.fn(), exchangeCodeForSession },
    };

    const result = await completePasswordRecovery(supabase as never, {
      tokenHash: null,
      type: null,
      code: "pkce-code",
      error: null,
    });

    expect(result).toEqual({ ok: true });
    expect(exchangeCodeForSession).toHaveBeenCalledWith("pkce-code");
  });

  it("returns exchange_failed when verifyOtp fails", async () => {
    const supabase = {
      auth: {
        verifyOtp: vi.fn().mockResolvedValue({ error: { message: "invalid" } }),
        exchangeCodeForSession: vi.fn(),
      },
    };

    const result = await completePasswordRecovery(supabase as never, {
      tokenHash: "hash-value",
      type: "recovery",
      code: null,
      error: null,
    });

    expect(result).toEqual({ ok: false, reason: "exchange_failed" });
  });
});
