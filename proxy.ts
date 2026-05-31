import { type NextRequest, NextResponse } from "next/server";
import {
  getDevSessionFromRequest,
  isDevAuthBypassEnabled,
} from "@/lib/auth/dev-bypass";
import { getRedirectForRole } from "@/lib/auth/routes";
import { updateSession } from "@/lib/supabase/middleware";
import type { AppSession } from "@/types";

const PROTECTED_PREFIXES = [
  { prefix: "/staff/dashboard", role: "STAFF" },
  { prefix: "/store/dashboard", role: "STORE_MANAGER" },
  { prefix: "/admin/dashboard", role: "MASTER_ADMIN" },
] as const;

function isAppRole(value: unknown): value is AppSession["role"] {
  return value === "STAFF" || value === "STORE_MANAGER" || value === "MASTER_ADMIN";
}

function redirectIfSignedIn(
  request: NextRequest,
  role: AppSession["role"],
): NextResponse {
  return NextResponse.redirect(new URL(getRedirectForRole(role), request.url));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    if (isDevAuthBypassEnabled()) {
      const devSession = getDevSessionFromRequest(request);
      if (devSession) {
        return redirectIfSignedIn(request, devSession.role);
      }
      return NextResponse.next({ request });
    }

    const { response, user } = await updateSession(request);
    const metadataRole = user?.app_metadata?.role;
    if (user && isAppRole(metadataRole)) {
      return redirectIfSignedIn(request, metadataRole);
    }
    return response;
  }

  const protectedRoute = PROTECTED_PREFIXES.find((r) =>
    pathname.startsWith(r.prefix),
  );

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

  const { response, user } = await updateSession(request);

  if (!user) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
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
    "/",
    "/staff/dashboard/:path*",
    "/store/dashboard/:path*",
    "/admin/dashboard/:path*",
  ],
};
