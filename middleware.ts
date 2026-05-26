import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

export function middleware(
  ...args: Parameters<typeof auth>
): ReturnType<typeof auth> {
  return auth(...args);
}

export const config = {
  matcher: [
    "/staff/dashboard/:path*",
    "/store/dashboard/:path*",
    "/admin/dashboard/:path*",
  ],
};
