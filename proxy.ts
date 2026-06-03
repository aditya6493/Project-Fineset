import { type NextRequest, NextResponse } from "next/server";
import {
  getDevSessionFromRequest,
  isDevAuthBypassEnabled,
} from "@/lib/auth/dev-bypass";
import { updateSession } from "@/lib/supabase/middleware";

/** Dashboard routes that require an authenticated user with the matching role. */
const PROTECTED_PREFIXES = [
  { prefix: "/staff/dashboard", role: "STAFF" },
  { prefix: "/store/dashboard", role: "STORE_MANAGER" },
  { prefix: "/admin/dashboard", role: "MASTER_ADMIN" },
] as const;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoute = PROTECTED_PREFIXES.find((r) =>
    pathname.startsWith(r.prefix),
  );

  // API routes in the matcher only need session refresh (handled above).
  if (!protectedRoute) {
    if (isDevAuthBypassEnabled()) {
      return NextResponse.next({ request });
    }

    const { response } = await updateSession(request);
    return response;
  }

  if (isDevAuthBypassEnabled()) {
    const devSession = getDevSessionFromRequest(request);
    if (!devSession) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (devSession.role !== protectedRoute.role) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("error", "wrong_portal");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({ request });
  }

  const { response, user, sessionExpired } = await updateSession(request);

  if (!user) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    if (sessionExpired) {
      loginUrl.searchParams.set("error", "session_expired");
    }
    return NextResponse.redirect(loginUrl);
  }

  const metadataRole = user.app_metadata?.role as string | undefined;
  if (metadataRole && metadataRole !== protectedRoute.role) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("error", "wrong_portal");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/api/sync/:path*",
    "/api/analytics/:path*",
    "/api/staff/:path*",
    "/api/calls/:path*",
    "/api/visits/:path*",
    "/api/field-sales/:path*",
    "/staff/dashboard/:path*",
    "/store/dashboard/:path*",
    "/admin/dashboard/:path*",
  ],
};
