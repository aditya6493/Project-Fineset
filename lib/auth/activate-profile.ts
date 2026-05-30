import { prisma } from "@/lib/db/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppUser, Store } from "@prisma/client";
import type { AppSession } from "@/types";

type AppUserWithRelations = AppUser & {
  store: Pick<Store, "name"> | null;
  staff: { employeeId: string } | null;
};

function buildAppMetadata(profile: AppUserWithRelations) {
  return {
    role: profile.role,
    storeId: profile.storeId,
    staffId: profile.staffId,
    appUserId: profile.id,
    name: profile.name,
    storeName: profile.store?.name ?? null,
    employeeId: profile.staff?.employeeId ?? null,
    isActive: profile.isActive,
  };
}

async function syncSupabaseMetadata(
  authId: string,
  profile: AppUserWithRelations,
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.auth.admin.updateUserById(authId, {
      app_metadata: buildAppMetadata(profile),
    });
  } catch (error) {
    console.error("[activate-profile] metadata sync failed", authId, error);
  }
}

/**
 * Mark AppUser active after successful auth callback or password login.
 */
export async function activateProfileForAuthUser(
  authId: string,
  email: string,
  options: { awaitMetadataSync?: boolean } = {},
): Promise<AppUserWithRelations | null> {
  const profile = await prisma.appUser.findUnique({
    where: { authId },
    include: {
      store: { select: { name: true } },
      staff: { select: { employeeId: true } },
    },
  });

  if (!profile) {
    void logAuthEvent({
      event: "UNAUTHORIZED_ACCESS",
      authId,
      email,
      metadata: { reason: "no_app_user_profile" },
    });
    return null;
  }

  const isFirstActivation = !profile.isActive;
  const now = new Date();

  if (isFirstActivation) {
    await prisma.appUser.update({
      where: { id: profile.id },
      data: {
        isActive: true,
        activatedAt: now,
        lastLoginAt: now,
      },
    });
    profile.isActive = true;
    profile.activatedAt = now;
    profile.lastLoginAt = now;

    void logAuthEvent({
      event: "USER_ACTIVATED",
      authId,
      email: profile.email,
    });
  } else {
    void prisma.appUser
      .update({
        where: { id: profile.id },
        data: { lastLoginAt: now },
      })
      .catch((error) => {
        console.error("[activate-profile] lastLogin update failed", profile.id, error);
      });
  }

  const shouldAwaitSync = options.awaitMetadataSync || isFirstActivation;
  if (shouldAwaitSync) {
    await syncSupabaseMetadata(authId, profile);
  } else {
    void syncSupabaseMetadata(authId, profile);
  }

  return profile;
}

export async function syncAuthMetadataForSession(
  authId: string,
  session: AppSession,
): Promise<void> {
  try {
    const profile = await prisma.appUser.findUnique({
      where: { id: session.userId },
      include: {
        store: { select: { name: true } },
        staff: { select: { employeeId: true } },
      },
    });

    if (!profile) {
      return;
    }

    const supabase = createAdminClient();
    await supabase.auth.admin.updateUserById(authId, {
      app_metadata: buildAppMetadata(profile),
    });
  } catch (error) {
    console.error("[activate-profile] session metadata sync failed", authId, error);
  }
}
