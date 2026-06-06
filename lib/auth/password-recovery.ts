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

type RecoveryAmrEntry = { method?: string; timestamp?: number };

function readUserAmr(user: User | null | undefined): RecoveryAmrEntry[] | undefined {
  if (!user || typeof user !== "object") return undefined;

  const amr = (user as User & { amr?: RecoveryAmrEntry[] }).amr;
  return Array.isArray(amr) ? amr : undefined;
}

export function isRecoverySessionUser(user: User | null | undefined): boolean {
  const amr = readUserAmr(user);
  if (!amr?.length) return false;

  return amr.some((entry) => {
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
