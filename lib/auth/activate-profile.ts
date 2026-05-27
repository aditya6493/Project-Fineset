import { prisma } from "@/lib/db/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Mark AppUser active after successful auth callback (invite acceptance or first login).
 */
export async function activateProfileForAuthUser(
  authId: string,
  email: string,
): Promise<void> {
  const profile = await prisma.appUser.findUnique({
    where: { authId },
  });

  if (!profile) {
    await logAuthEvent({
      event: "UNAUTHORIZED_ACCESS",
      authId,
      email,
      metadata: { reason: "no_app_user_profile" },
    });
    return;
  }

  if (!profile.isActive) {
    await prisma.appUser.update({
      where: { id: profile.id },
      data: {
        isActive: true,
        activatedAt: new Date(),
      },
    });

    await logAuthEvent({
      event: "USER_ACTIVATED",
      authId,
      email: profile.email,
    });
  }

  await prisma.appUser.update({
    where: { id: profile.id },
    data: { lastLoginAt: new Date() },
  });

  const supabase = createAdminClient();
  await supabase.auth.admin.updateUserById(authId, {
    app_metadata: {
      role: profile.role,
      storeId: profile.storeId,
      staffId: profile.staffId,
      appUserId: profile.id,
    },
  });
}
