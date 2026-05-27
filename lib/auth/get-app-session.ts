import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import type { AppSession } from "@/types";
import type { AppRole, AppUser, Store } from "@prisma/client";

type AppUserWithRelations = AppUser & {
  store: Pick<Store, "name"> | null;
  staff: { employeeId: string } | null;
};

function toAppSession(profile: AppUserWithRelations, email: string): AppSession {
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
      if (!profile.storeId || !profile.store) {
        throw new Error("Store manager profile is missing store assignment");
      }
      return {
        ...base,
        role: "STORE_MANAGER",
        storeId: profile.storeId,
        storeName: profile.store.name,
      };
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

export async function getAppSession(): Promise<AppSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  const profile = await prisma.appUser.findUnique({
    where: { authId: user.id },
    include: {
      store: { select: { name: true } },
      staff: { select: { employeeId: true } },
    },
  });

  if (!profile?.isActive) {
    return null;
  }

  try {
    return toAppSession(profile, user.email);
  } catch (err) {
    console.error("[getAppSession] invalid profile", profile.id, err);
    return null;
  }
}

export async function touchLastLogin(appUserId: string): Promise<void> {
  await prisma.appUser.update({
    where: { id: appUserId },
    data: { lastLoginAt: new Date() },
  });
}

export function appRoleFromSessionRole(role: AppSession["role"]): AppRole {
  return role;
}
