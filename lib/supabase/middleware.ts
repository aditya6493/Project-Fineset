import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseAuthDisabled } from "@/lib/supabase/env";
import { getSupabaseServerCookieOptions } from "@/lib/supabase/cookie-options";

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  if (isSupabaseAuthDisabled()) {
    return { response: NextResponse.next({ request }), user: null };
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
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
