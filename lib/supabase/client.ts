import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { getSupabaseBrowserCookieOptions } from "@/lib/supabase/cookie-options";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookieOptions: getSupabaseBrowserCookieOptions(),
  });
}
