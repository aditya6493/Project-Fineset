import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Verifies the master admin password without mutating the current session cookies.
 */
export async function verifyAdminPassword(
  email: string,
  password: string,
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return false;
  }

  const url = `${getSupabaseUrl()}/auth/v1/token?grant_type=password`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: getSupabaseAnonKey(),
    },
    body: JSON.stringify({ email: normalizedEmail, password }),
  });

  return response.ok;
}
