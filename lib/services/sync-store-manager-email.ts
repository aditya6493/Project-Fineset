import { prisma } from "@/lib/db/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { StoreServiceError } from "@/lib/services/store-service-error";

/** Normalize store manager email for Store / AppUser / Supabase Auth. */
export function normalizeStoreManagerEmail(
  email: string | null | undefined,
): string | null {
  if (email === null || email === undefined) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

/** True when an update payload includes a manager email change worth syncing. */
export function managerEmailNeedsSync(
  currentManagerEmail: string,
  nextEmail: string | null | undefined,
  emailInPayload: boolean,
): boolean {
  if (!emailInPayload) return false;
  const normalized = normalizeStoreManagerEmail(nextEmail);
  if (!normalized) return false;
  return normalized !== currentManagerEmail.trim().toLowerCase();
}

/**
 * When admin edits store email, sync Supabase Auth + AppUser so login uses the new address.
 */
export async function syncStoreManagerEmail(
  storeId: string,
  nextEmailRaw: string | null | undefined,
  options: { storeName?: string } = {},
): Promise<void> {
  if (nextEmailRaw === undefined) return;

  const nextEmail = normalizeStoreManagerEmail(nextEmailRaw);
  if (!nextEmail) return;

  const manager = await prisma.appUser.findFirst({
    where: { storeId, role: "BUSINESS_OWNER" },
    orderBy: { createdAt: "asc" },
    include: {
      store: { select: { name: true } },
      staff: { select: { employeeId: true } },
    },
  });

  if (!manager) return;

  const currentEmail = manager.email.trim().toLowerCase();
  if (nextEmail === currentEmail) return;

  const conflict = await prisma.appUser.findUnique({
    where: { email: nextEmail },
    select: { id: true },
  });
  if (conflict && conflict.id !== manager.id) {
    throw new StoreServiceError("This email is already registered", 409);
  }

  const supabase = createAdminClient();
  const storeName = manager.store?.name ?? options.storeName ?? null;
  const { error } = await supabase.auth.admin.updateUserById(manager.authId, {
    email: nextEmail,
    app_metadata: {
      role: manager.role,
      storeId: manager.storeId,
      staffId: manager.staffId,
      appUserId: manager.id,
      name: manager.name,
      storeName,
      employeeId: manager.staff?.employeeId ?? null,
      isActive: manager.isActive,
    },
  });

  if (error) {
    if (
      error.message.includes("already been registered") ||
      error.message.includes("already exists")
    ) {
      throw new StoreServiceError("This email is already registered", 409);
    }
    throw new StoreServiceError(
      error.message ?? "Failed to update manager login email",
      502,
    );
  }

  await prisma.appUser.update({
    where: { id: manager.id },
    data: { email: nextEmail },
  });
}
