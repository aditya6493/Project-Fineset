import type { User } from "@supabase/supabase-js";
import type { AppSession, UserRole } from "@/types";

function parseRole(value: unknown): UserRole | null {
  if (value === "STAFF" || value === "STORE_MANAGER" || value === "MASTER_ADMIN") {
    return value;
  }
  return null;
}

function isMetadataActive(meta: Record<string, unknown>): boolean {
  return meta.isActive !== false;
}

/**
 * Build AppSession from Supabase JWT app_metadata when all required fields are present.
 * Returns null when metadata is incomplete — caller should fall back to Prisma.
 */
export function appSessionFromSupabaseUser(user: User): AppSession | null {
  const meta = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (!isMetadataActive(meta)) {
    return null;
  }

  const role = parseRole(meta.role);
  const appUserId = typeof meta.appUserId === "string" ? meta.appUserId : null;
  const email = user.email?.trim().toLowerCase();

  if (!role || !appUserId || !email) {
    return null;
  }

  const base = { userId: appUserId, email };

  switch (role) {
    case "STAFF": {
      const staffId = typeof meta.staffId === "string" ? meta.staffId : null;
      const storeId = typeof meta.storeId === "string" ? meta.storeId : null;
      const name = typeof meta.name === "string" ? meta.name : null;
      if (!staffId || !storeId || !name) {
        return null;
      }
      return {
        ...base,
        role: "STAFF",
        staffId,
        storeId,
        name,
        employeeId:
          typeof meta.employeeId === "string" ? meta.employeeId : undefined,
      };
    }
    case "STORE_MANAGER": {
      const storeId = typeof meta.storeId === "string" ? meta.storeId : null;
      const storeName =
        typeof meta.storeName === "string" ? meta.storeName : null;
      if (!storeId || !storeName) {
        return null;
      }
      return {
        ...base,
        role: "STORE_MANAGER",
        storeId,
        storeName,
      };
    }
    case "MASTER_ADMIN":
      return {
        ...base,
        role: "MASTER_ADMIN",
      };
  }
}

export function isMetadataComplete(user: User): boolean {
  return appSessionFromSupabaseUser(user) !== null;
}
