import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { syncAuthMetadataForSession } from "@/lib/auth/activate-profile";
import {
  getDevSessionFromCookies,
  isDevAuthBypassEnabled,
  resolveDevAppSession,
} from "@/lib/auth/dev-bypass";
import { appSessionFromSupabaseUser } from "@/lib/auth/session-from-metadata";
import { createClient } from "@/lib/supabase/server";
import { isInvalidRefreshTokenError } from "@/lib/supabase/auth-errors";
import { isSupabaseAuthDisabled } from "@/lib/supabase/env";
import type { AppSession } from "@/types";
import type { AppRole, AppUser, Store } from "@prisma/client";

type AppUserWithRelations = AppUser & {
  store: Pick<Store, "name"> | null;
  staff: { employeeId: string } | null;
};

async function getProfileByAuthId(authId: string): Promise<AppUserWithRelations | null> {
  return prisma.appUser.findUnique({
    where: { authId },
    include: {
      store: { select: { name: true } },
      staff: { select: { employeeId: true } },
    },
  });
}

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

async function resolveAppSession(): Promise<AppSession | null> {
  if (isDevAuthBypassEnabled()) {
    const devCookie = await getDevSessionFromCookies();
    if (devCookie) {
      return resolveDevAppSession(devCookie);
    }
    return null;
  }

  if (isSupabaseAuthDisabled()) {
    return null;
  }

  const supabase = await createClient();
  let user;
  let error;
  try {
    ({ data: { user }, error } = await supabase.auth.getUser());
  } catch {
    return null;
  }

  if (error) {
    if (isInvalidRefreshTokenError(error)) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore — cookies cleared on next middleware pass
      }
    } else {
      console.warn("[getAppSession] supabase getUser failed", error.message);
    }
    return null;
  }

  if (!user?.email) {
    return null;
  }

  const fromMetadata = appSessionFromSupabaseUser(user);
  if (fromMetadata) {
    return fromMetadata;
  }

  const session = await getAppSessionForAuthUser(user.id, user.email);
  if (session) {
    void syncAuthMetadataForSession(user.id, session);
  }

  return session;
}

/** Request-scoped session resolution with metadata-first fast path. */
export const getAppSession = cache(resolveAppSession);

export async function getAppSessionForAuthUser(
  authId: string,
  email: string,
): Promise<AppSession | null> {
  const profile = await getProfileByAuthId(authId);

  if (!profile?.isActive) {
    return null;
  }

  try {
    return appSessionFromProfile(profile, email);
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
