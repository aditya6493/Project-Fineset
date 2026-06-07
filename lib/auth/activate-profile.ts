import { prisma } from "@/lib/db/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import type { AppUserWithRelations } from "@/lib/auth/app-session-from-profile";
import {
  resolveEffectiveRole,
  shouldPromoteToBusinessOwner,
} from "@/lib/auth/resolve-effective-role";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppSession } from "@/types";

export function buildAppMetadata(profile: AppUserWithRelations) {
  return {
    role: resolveEffectiveRole(profile.role, profile.staffId),
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
      staff: {
        select: {
          employeeId: true,
          storeId: true,
          store: { select: { name: true } },
        },
      },
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

  if (shouldPromoteToBusinessOwner(profile.role, profile.staffId)) {
    try {
      await prisma.appUser.update({
        where: { id: profile.id },
        data: { role: "BUSINESS_OWNER" },
      });
      profile.role = "BUSINESS_OWNER";
    } catch (error) {
      console.warn(
        "[activate-profile] BUSINESS_OWNER promotion skipped — run prisma migrate deploy",
        profile.id,
        error,
      );
    }
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
        staff: {
        select: {
          employeeId: true,
          storeId: true,
          store: { select: { name: true } },
        },
      },
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
