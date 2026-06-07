import { resolveEffectiveRole } from "@/lib/auth/resolve-effective-role";
import type { AppSession } from "@/types";
import type { AppUser, Store } from "@prisma/client";

export type AppUserWithRelations = AppUser & {
  store: Pick<Store, "name"> | null;
  staff: {
    employeeId: string;
    storeId: string;
    store: Pick<Store, "name"> | null;
  } | null;
};

export function appSessionFromProfile(
  profile: AppUserWithRelations,
  email: string,
): AppSession {
  const base = {
    userId: profile.id,
    email: email.toLowerCase(),
  };

  switch (profile.role) {
    case "STAFF":
      if (!profile.staffId || !profile.storeId) {
        throw new Error("Staff profile is missing staff or store assignment");
      }
      return {
        ...base,
        role: "STAFF",
        staffId: profile.staffId,
        storeId: profile.storeId,
        name: profile.name,
        employeeId: profile.staff?.employeeId,
      };
    case "STORE_MANAGER":
    case "BUSINESS_OWNER": {
      const role = resolveEffectiveRole(profile.role, profile.staffId);
      const assignedStore =
        role === "STORE_MANAGER" && profile.staff?.store
          ? profile.staff.store
          : profile.store;
      const assignedStoreId =
        role === "STORE_MANAGER" && profile.staff?.storeId
          ? profile.staff.storeId
          : profile.storeId;

      if (!assignedStoreId || !assignedStore) {
        throw new Error("Store portal profile is missing store assignment");
      }

      const effectiveRole = resolveEffectiveRole(profile.role, profile.staffId);
      if (effectiveRole === "BUSINESS_OWNER") {
        return {
          ...base,
          role: "BUSINESS_OWNER",
          storeId: assignedStoreId,
          storeName: assignedStore.name,
        };
      }

      return {
        ...base,
        role: "STORE_MANAGER",
        storeId: assignedStoreId,
        storeName: assignedStore.name,
      };
    }
    case "MASTER_ADMIN":
      return {
        ...base,
        role: "MASTER_ADMIN",
      };
    default: {
      const _exhaustive: never = profile.role;
      throw new Error(`Unknown role: ${String(_exhaustive)}`);
    }
  }
}
