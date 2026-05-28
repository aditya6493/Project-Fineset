import { prisma } from "@/lib/db/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppUser, Store } from "@prisma/client";
import type { AppSession } from "@/types";

type AppUserWithRelations = AppUser & {
  store: Pick<Store, "name"> | null;
  staff: { employeeId: string } | null;
};

/**
 * Mark AppUser active after successful auth callback (invite acceptance or first login).
 */
export async function activateProfileForAuthUser(
  authId: string,
  email: string,
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
      },
    });
    profile.isActive = true;
    profile.activatedAt = now;
  }

  // Non-critical bookkeeping: don't block login response.
  void prisma.appUser
    .update({
      where: { id: profile.id },
      data: { lastLoginAt: now },
    })
    .catch((error) => {
      console.error("[activate-profile] lastLogin update failed", profile.id, error);
    });

  if (isFirstActivation) {
    void logAuthEvent({
      event: "USER_ACTIVATED",
      authId,
      email: profile.email,
    });
  }

  // Metadata sync is non-blocking for login response.
  void syncSupabaseMetadata(authId, profile);
  return profile;
}

async function syncSupabaseMetadata(
  authId: string,
  profile: {
    role: string;
    storeId: string | null;
    staffId: string | null;
    id: string;
  },
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.auth.admin.updateUserById(authId, {
      app_metadata: {
        role: profile.role,
        storeId: profile.storeId,
        staffId: profile.staffId,
        appUserId: profile.id,
      },
    });
  } catch (error) {
    console.error("[activate-profile] metadata sync failed", authId, error);
  }
}

export async function syncAuthMetadataForSession(
  authId: string,
  session: AppSession,
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.auth.admin.updateUserById(authId, {
      app_metadata: {
        role: session.role,
        storeId:
          session.role === "MASTER_ADMIN"
            ? null
            : session.storeId,
        staffId: session.role === "STAFF" ? session.staffId : null,
        appUserId: session.userId,
      },
    });
  } catch (error) {
    console.error("[activate-profile] session metadata sync failed", authId, error);
  }
}
