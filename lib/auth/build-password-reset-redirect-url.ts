import { getAuthRedirectBaseUrl } from "@/lib/supabase/env";
import { PASSWORD_RECOVERY_PATH } from "@/lib/auth/password-recovery";

export function buildPasswordResetRedirectUrl(origin?: string): string {
  const base = (origin ?? getAuthRedirectBaseUrl()).replace(/\/$/, "");
  const next = encodeURIComponent(PASSWORD_RECOVERY_PATH);
  return `${base}/auth/callback?next=${next}`;
}
