import { getAuthRedirectBaseUrl } from "@/lib/supabase/env";
import { PASSWORD_RECOVERY_PATH } from "@/lib/auth/password-recovery";

export function buildPasswordResetRedirectUrl(origin?: string): string {
  const base = (origin ?? getAuthRedirectBaseUrl()).replace(/\/$/, "");
  return `${base}${PASSWORD_RECOVERY_PATH}`;
}
