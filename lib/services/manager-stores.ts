import { mergeStoreWhere } from "@/lib/db/store-scope";
import { prisma } from "@/lib/db/prisma";
import type { ManagerStoreOption } from "@/types";

/**
 * Stores linked to a manager login email:
 * - Store.email matches the login email (same contact on multiple shops), or
 * - Store.id is the manager's primary AppUser.storeId assignment.
 */
export async function listStoresLinkedToManagerEmail(
  email: string,
  primaryStoreId: string,
): Promise<ManagerStoreOption[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];

  return prisma.store.findMany({
    where: mergeStoreWhere({
      isActive: true,
      OR: [
        { email: { equals: normalized, mode: "insensitive" } },
        { id: primaryStoreId },
      ],
    }),
    select: { id: true, name: true },
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
