import type { AppRole } from "@prisma/client";
import type { UserRole } from "@/types";

/**
 * Owner logins were historically STORE_MANAGER without a staff record.
 * Per-store managers always have staffId set via Staff Management invite.
 */
export function resolveEffectiveRole(
  role: AppRole | UserRole,
  staffId: string | null | undefined,
): UserRole {
  if (role === "STORE_MANAGER" && !staffId) {
    return "BUSINESS_OWNER";
  }
  return role as UserRole;
}

export function shouldPromoteToBusinessOwner(
  role: AppRole,
  staffId: string | null | undefined,
): boolean {
  return role === "STORE_MANAGER" && !staffId;
}
