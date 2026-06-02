export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured");
  }
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return key;
}

export function getAuthRedirectBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    process.env.AUTH_URL?.trim() ??
    process.env.NEXTAUTH_URL?.trim() ??
    "http://localhost:3000"
  );
}

/** CI/e2e use a non-routable Supabase host; skip remote auth calls. */
export function isSupabaseAuthDisabled(): boolean {
  const url = getSupabaseUrl();
  return url.includes("placeholder.supabase.co");
}
