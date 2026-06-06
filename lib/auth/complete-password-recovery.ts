import type { SupabaseClient } from "@supabase/supabase-js";

export type PasswordRecoveryUrlParams = {
  tokenHash: string | null;
  type: string | null;
  code: string | null;
  error: string | null;
};

export function parsePasswordRecoveryUrlParams(
  searchParams: Pick<URLSearchParams, "get">,
): PasswordRecoveryUrlParams {
  return {
    tokenHash: searchParams.get("token_hash"),
    type: searchParams.get("type"),
    code: searchParams.get("code"),
    error: searchParams.get("error"),
  };
}

export function shouldAttemptPasswordRecovery(
  params: PasswordRecoveryUrlParams,
): boolean {
  if (params.error) return false;
  if (params.tokenHash && params.type === "recovery") return true;
  if (params.code) return true;
  return false;
}

export function stripPasswordRecoveryUrlParams(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const keys = ["token_hash", "type", "code", "error"];
  let changed = false;

  for (const key of keys) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  if (changed) {
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }
}

export type CompletePasswordRecoveryResult =
  | { ok: true }
  | { ok: false; reason: "invalid_link" | "exchange_failed" };

export async function completePasswordRecovery(
  supabase: SupabaseClient,
  params: PasswordRecoveryUrlParams,
): Promise<CompletePasswordRecoveryResult> {
  if (params.tokenHash && params.type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: params.tokenHash,
      type: "recovery",
    });

    if (error) {
      return { ok: false, reason: "exchange_failed" };
    }

    stripPasswordRecoveryUrlParams();
    return { ok: true };
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);

    if (error) {
      return { ok: false, reason: "exchange_failed" };
    }

    stripPasswordRecoveryUrlParams();
    return { ok: true };
  }

  return { ok: false, reason: "invalid_link" };
}
