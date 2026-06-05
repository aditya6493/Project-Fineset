import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { mergeStoreWhere } from "@/lib/db/store-scope";
import { prisma } from "@/lib/db/prisma";
import { shouldUseSecureAuthCookies } from "@/lib/supabase/cookie-options";
import type { AppSession, UserRole } from "@/types";

export const DEV_SESSION_COOKIE = "fineset-dev-session";

const DEV_EMAIL_ROLES: Record<string, UserRole> = {
  "admin@fineset.local": "MASTER_ADMIN",
  "manager@store-alpha.local": "STORE_MANAGER",
  "staff-a@store-alpha.local": "STAFF",
};

/** Dev-only auth bypass — never enabled in production. */
export function isDevAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_AUTH_BYPASS === "true"
  );
}

export function inferDevRole(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  const mapped = DEV_EMAIL_ROLES[normalized];
  if (mapped) return mapped;

  const configured = process.env.DEV_AUTH_ROLE?.trim();
  if (
    configured === "STAFF" ||
    configured === "STORE_MANAGER" ||
    configured === "MASTER_ADMIN"
  ) {
    return configured;
  }

  return "MASTER_ADMIN";
}

export type DevSessionCookie = {
  email: string;
  role: UserRole;
};

export function parseDevSessionCookie(value: string | undefined): DevSessionCookie | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as DevSessionCookie;
    if (
      typeof parsed.email === "string" &&
      (parsed.role === "STAFF" ||
        parsed.role === "STORE_MANAGER" ||
        parsed.role === "MASTER_ADMIN")
    ) {
      return {
        email: parsed.email.toLowerCase(),
        role: parsed.role,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function serializeDevSessionCookie(session: DevSessionCookie): string {
  return JSON.stringify({
    email: session.email.toLowerCase(),
    role: session.role,
  });
}

export function getDevSessionFromRequest(request: NextRequest): DevSessionCookie | null {
  if (!isDevAuthBypassEnabled()) return null;
  return parseDevSessionCookie(request.cookies.get(DEV_SESSION_COOKIE)?.value);
}

export async function getDevSessionFromCookies(): Promise<DevSessionCookie | null> {
  if (!isDevAuthBypassEnabled()) return null;
  const cookieStore = await cookies();
  return parseDevSessionCookie(cookieStore.get(DEV_SESSION_COOKIE)?.value);
}

export async function setDevSessionCookie(session: DevSessionCookie): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DEV_SESSION_COOKIE, serializeDevSessionCookie(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureAuthCookies(),
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
}

export async function clearDevSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_SESSION_COOKIE);
}

/** Static session that never touches the database. */
export function buildStaticDevSession(email: string, role: UserRole): AppSession {
  const normalized = email.trim().toLowerCase();

  switch (role) {
    case "STAFF":
      return {
        userId: "dev-staff-a",
        email: normalized,
        role: "STAFF",
        staffId: "dev-staff-emp001",
        storeId: "dev-store-alpha",
        name: "Staff Member A",
        employeeId: "EMP001",
      };
    case "STORE_MANAGER":
      return {
        userId: "dev-store-manager",
        email: normalized,
        role: "STORE_MANAGER",
        storeId: "dev-store-alpha",
        storeName: "Store Alpha",
      };
    case "MASTER_ADMIN":
      return {
        userId: "dev-master-admin",
        email: normalized,
        role: "MASTER_ADMIN",
      };
  }
}

async function enrichDevSessionFromDb(
  email: string,
  role: UserRole,
): Promise<AppSession | null> {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  if (
    !databaseUrl.startsWith("postgresql://") &&
    !databaseUrl.startsWith("postgres://")
  ) {
    return null;
  }

  try {
    const profile = await prisma.appUser.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        store: { select: { name: true } },
        staff: { select: { employeeId: true } },
      },
    });

    if (profile?.isActive) {
      const base = {
        userId: profile.id,
        email: email.toLowerCase(),
      };

      switch (profile.role) {
        case "STAFF":
          if (profile.staffId && profile.storeId) {
            return {
              ...base,
              role: "STAFF",
              staffId: profile.staffId,
              storeId: profile.storeId,
              name: profile.name,
              employeeId: profile.staff?.employeeId,
            };
          }
          break;
        case "STORE_MANAGER":
          if (profile.storeId && profile.store) {
            return {
              ...base,
              role: "STORE_MANAGER",
              storeId: profile.storeId,
              storeName: profile.store.name,
            };
          }
          break;
        case "MASTER_ADMIN":
          return {
            ...base,
            role: "MASTER_ADMIN",
          };
      }
    }

    if (role === "STAFF") {
      const staff = await prisma.staff.findFirst({
        where: { employeeId: "EMP001", isActive: true },
        include: { store: { select: { name: true } } },
      });
      if (staff) {
        return {
          userId: `dev-${staff.id}`,
          email: email.toLowerCase(),
          role: "STAFF",
          staffId: staff.id,
          storeId: staff.storeId,
          name: staff.name,
          employeeId: staff.employeeId,
        };
      }
    }

    if (role === "STORE_MANAGER") {
      const store = await prisma.store.findFirst({
        where: mergeStoreWhere({ name: "Store Alpha", isActive: true }),
      });
      if (store) {
        return {
          userId: `dev-manager-${store.id}`,
          email: email.toLowerCase(),
          role: "STORE_MANAGER",
          storeId: store.id,
          storeName: store.name,
        };
      }
    }
  } catch (err) {
    console.warn("[dev-bypass] DB enrichment skipped, using static session", err);
  }

  return null;
}

async function resolveDevAppSessionInternal(
  email: string,
  role: UserRole,
): Promise<AppSession> {
  const enriched = await enrichDevSessionFromDb(email, role);
  return enriched ?? buildStaticDevSession(email, role);
}

export async function resolveDevAppSession(
  cookie: DevSessionCookie,
): Promise<AppSession> {
  return resolveDevAppSessionInternal(cookie.email, cookie.role);
}

export async function createDevSessionForEmail(email: string): Promise<AppSession> {
  const normalized = email.trim().toLowerCase();
  const role = inferDevRole(normalized);
  return resolveDevAppSessionInternal(normalized, role);
}
