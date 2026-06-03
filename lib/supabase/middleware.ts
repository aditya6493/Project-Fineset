import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { isInvalidRefreshTokenError } from "@/lib/supabase/auth-errors";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseAuthDisabled } from "@/lib/supabase/env";
import { getSupabaseServerCookieOptions } from "@/lib/supabase/cookie-options";

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
  sessionExpired: boolean;
}> {
  if (isSupabaseAuthDisabled()) {
    return { response: NextResponse.next({ request }), user: null, sessionExpired: false };
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookieOptions: getSupabaseServerCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && isInvalidRefreshTokenError(error)) {
    await supabase.auth.signOut();
    return { response: supabaseResponse, user: null, sessionExpired: true };
  }

  return { response: supabaseResponse, user, sessionExpired: false };
}
