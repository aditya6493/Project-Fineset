"use server";

import { buildPasswordResetRedirectUrl } from "@/lib/auth/build-password-reset-redirect-url";
import { parsePasswordResetClientError } from "@/lib/auth/parse-password-reset-error";
import { logAuthEvent } from "@/lib/auth/audit";
import { createClient } from "@/lib/supabase/server";
import { checkLoginRateLimit, getRequestIdentifier } from "@/lib/rate-limit";

export type PasswordResetRequestResult =
  | { ok: true }
  | {
      ok: false;
      code: "invalid_email" | "rate_limited" | "redirect_not_allowed" | "failed";
    };

export async function requestPasswordResetAction(
  email: string,
): Promise<PasswordResetRequestResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, code: "invalid_email" };
  }

  const identifier = await getRequestIdentifier();
  const rateLimit = await checkLoginRateLimit(`${identifier}:reset:${normalizedEmail}`);
  if (!rateLimit.success) {
    return { ok: false, code: "rate_limited" };
  }

  try {
    const supabase = await createClient();
    const redirectTo = buildPasswordResetRedirectUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      console.error("[password-reset]", error.message);
      return { ok: false, code: parsePasswordResetClientError(error.message) };
    }

    void logAuthEvent({
      event: "PASSWORD_RESET_REQUESTED",
      email: normalizedEmail,
    });

    return { ok: true };
  } catch (error) {
    console.error("[password-reset]", error);
    return { ok: false, code: "failed" };
  }
}
