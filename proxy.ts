import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const PROTECTED_PREFIXES = [
  { prefix: "/staff/dashboard", role: "STAFF" },
  { prefix: "/store/dashboard", role: "STORE_MANAGER" },
  { prefix: "/admin/dashboard", role: "MASTER_ADMIN" },
] as const;

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  const protectedRoute = PROTECTED_PREFIXES.find((r) =>
    pathname.startsWith(r.prefix),
  );

  if (!protectedRoute) {
    return response;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const metadataRole = user.app_metadata?.role as string | undefined;
  if (metadataRole && metadataRole !== protectedRoute.role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "wrong_portal");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/staff/dashboard/:path*",
    "/store/dashboard/:path*",
    "/admin/dashboard/:path*",
  ],
};
