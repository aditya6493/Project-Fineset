import type { CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { shouldUseSecureAuthCookies } from "@/lib/supabase/cookie-options";

export const PASSWORD_RECOVERY_FLOW_COOKIE = "fineset_password_recovery";
export const PASSWORD_RECOVERY_PATH = "/reset-password";
export const PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS = 60 * 10;

export function isPasswordRecoveryRedirect(
  next: string | null,
  type: string | null,
): boolean {
  return next === PASSWORD_RECOVERY_PATH || type === "recovery";
}

export function isRecoverySessionUser(user: User | null | undefined): boolean {
  if (!user?.amr?.length) return false;

  return user.amr.some((entry) => {
    const method =
      typeof entry === "object" && entry !== null && "method" in entry
        ? String((entry as { method?: string }).method ?? "")
        : "";
    return method.toLowerCase().includes("recovery");
  });
}

export function isPasswordRecoveryFlowPending(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}): boolean {
  return cookieStore.get(PASSWORD_RECOVERY_FLOW_COOKIE)?.value === "1";
}

export function getPasswordRecoveryCookieOptions(): CookieOptions {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureAuthCookies(),
    maxAge: PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS,
  };
}
