import { mergeStoreWhere } from "@/lib/db/store-scope";
import { prisma } from "@/lib/db/prisma";
import type { ManagerStoreOption } from "@/types";

export function normalizeManagerEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** True when a store-manager AppUser already exists for this email (shared across stores). */
export async function hasExistingStoreManagerLogin(email: string): Promise<boolean> {
  const normalized = normalizeManagerEmail(email);
  if (!normalized) return false;

  const user = await prisma.appUser.findUnique({
    where: { email: normalized },
    select: { role: true },
  });

  return user?.role === "STORE_MANAGER";
}

export async function findExistingStoreManagerByEmail(email: string) {
  const normalized = normalizeManagerEmail(email);
  if (!normalized) return null;

  return prisma.appUser.findFirst({
    where: { email: normalized, role: "STORE_MANAGER" },
    select: { id: true, email: true },
  });
}

/**
 * Stores linked to a manager login email:
 * - Store.businessOwnerEmail matches the login email (same contact on multiple shops), or
 * - Store.id is the manager's primary AppUser.storeId assignment.
 */
export async function listStoresLinkedToManagerEmail(
  email: string,
  primaryStoreId: string,
): Promise<ManagerStoreOption[]> {
  const normalized = normalizeManagerEmail(email);
  if (!normalized) return [];

  return prisma.store.findMany({
    where: mergeStoreWhere({
      isActive: true,
      OR: [
        { businessOwnerEmail: { equals: normalized, mode: "insensitive" } },
        { id: primaryStoreId },
      ],
    }),
    select: { id: true, name: true, city: true, state: true },
    orderBy: { name: "asc" },
  });
}

export async function isStoreAllowedForManagerEmail(
  email: string,
  primaryStoreId: string,
  storeId: string,
): Promise<boolean> {
  const stores = await listStoresLinkedToManagerEmail(email, primaryStoreId);
  return stores.some((store) => store.id === storeId);
}

export async function resolveManagerStoreId(
  email: string,
  primaryStoreId: string,
  requestedStoreId?: string,
): Promise<string> {
  const allowed = await listStoresLinkedToManagerEmail(email, primaryStoreId);
  if (allowed.length === 0) {
    return primaryStoreId;
  }

  const allowedIds = new Set(allowed.map((s) => s.id));
  if (requestedStoreId) {
    if (!allowedIds.has(requestedStoreId)) {
      throw new Error("STORE_ACCESS_DENIED");
    }
    return requestedStoreId;
  }

  if (allowedIds.has(primaryStoreId)) {
    return primaryStoreId;
  }

  return allowed[0]!.id;
}
