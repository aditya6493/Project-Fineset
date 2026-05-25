import type { NextAuthConfig } from "next-auth";
import type { AppSession } from "@/types";

export const authConfig = {
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const appUser = user as AppSession & { id: string };
        token.user = {
          role: appUser.role,
          ...(appUser.role === "STAFF" && {
            staffId: appUser.staffId,
            storeId: appUser.storeId,
            name: appUser.name,
          }),
          ...(appUser.role === "STORE_MANAGER" && {
            storeId: appUser.storeId,
            storeName: appUser.storeName,
          }),
        } as AppSession;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        (session as { user: AppSession }).user = token.user;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const user = auth?.user;

      const isStaffRoute =
        pathname.startsWith("/staff/dashboard");
      const isStoreRoute =
        pathname.startsWith("/store/dashboard");
      const isAdminRoute =
        pathname.startsWith("/admin/dashboard");

      if (isStaffRoute) return user?.role === "STAFF";
      if (isStoreRoute) return user?.role === "STORE_MANAGER";
      if (isAdminRoute) return user?.role === "MASTER_ADMIN";

      return true;
    },
  },
} satisfies NextAuthConfig;

export function isAppSession(value: unknown): value is AppSession {
  if (!value || typeof value !== "object") return false;
  const role = (value as AppSession).role;
  return role === "STAFF" || role === "STORE_MANAGER" || role === "MASTER_ADMIN";
}

export function getSessionStoreId(session: AppSession): string | null {
  if (session.role === "STAFF" || session.role === "STORE_MANAGER") {
    return session.storeId;
  }
  return null;
}
