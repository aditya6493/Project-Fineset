import type { CookieOptions } from "@supabase/ssr";

/** Keep auth cookies across app restarts until explicit sign-out (refresh token lifetime). */
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

export function getSupabaseCookieOptions(): CookieOptions {
  return {
    path: "/",
    sameSite: "lax",
    secure: shouldUseSecureAuthCookies(),
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  };
}

export function shouldUseSecureAuthCookies(): boolean {
  if (process.env.AUTH_COOKIE_SECURE === "true") return true;
  if (process.env.AUTH_COOKIE_SECURE === "false") return false;
  return process.env.NODE_ENV === "production";
}
