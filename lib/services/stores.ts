import { logAuthEvent } from "@/lib/auth/audit";
import { InviteError, inviteUser } from "@/lib/auth/invite-user";
import { validatePassword } from "@/lib/auth/password-policy";
import { ensureProductionStoreSchema } from "@/lib/db/ensure-production-store-schema";
import { prisma } from "@/lib/db/prisma";
import {
  mergeDeletedStoreWhere,
  mergeStoreWhere,
  purgeAtFromNow,
  storeNotDeletedWhere,
} from "@/lib/db/store-scope";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateStoreInput, UpdateStoreInput } from "@/lib/validations/store.schema";
import type { Store } from "@prisma/client";
import type { AnalyticsPeriodLabel, StorePerformanceRow } from "@/types";
import type { Prisma, PurchaseStatus } from "@prisma/client";
import {
  calculateConversionRate,
  calculateDelta,
  calculateTotalRevenue,
  getPeriodRange,
  getPreviousPeriodRange,
} from "@/lib/utils/analytics";

export async function listStores(params: {
  page: number;
  pageSize: number;
  search?: string;
  activeOnly?: boolean;
  includeDeleted?: boolean;
  period?: AnalyticsPeriodLabel;
}) {
  const period = params.period ?? "month";
  const { start, end } = getPeriodRange(period);
  const filters: Prisma.StoreWhereInput = {};

  if (params.activeOnly) {
    filters.isActive = true;
  }

  if (params.search?.trim()) {
    const term = params.search.trim();
    filters.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { state: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { pocName: { contains: term, mode: "insensitive" } },
    ];
  }

  const where = params.includeDeleted
    ? mergeDeletedStoreWhere(filters)
    : mergeStoreWhere(filters);

  // Run sequentially to avoid pool saturation on low connection limits.
  const stores = await prisma.store.findMany({
    where,
    orderBy: { name: "asc" },
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
    include: {
      _count: { select: { staff: true } },
      visits: {
        where: { visitDate: { gte: start, lte: end } },
        select: { purchaseStatus: true, transactionAmount: true },
      },
    },
  });
  const total = await prisma.store.count({ where });

  const mapped = stores.map((store) => ({
      id: store.id,
      name: store.name,
      category: store.category,
      customCategory: store.customCategory,
      city: store.city,
      state: store.state,
      pincode: store.pincode,
      pocName: store.pocName,
      pointOfContactPhone: store.pointOfContactPhone,
      email: store.email,
      isActive: store.isActive,
      deletedAt: store.deletedAt?.toISOString() ?? null,
      purgeAt: store.purgeAt?.toISOString() ?? null,
      staffCount: store._count.staff,
      visits: store.visits.length,
      revenue: calculateTotalRevenue(store.visits),
      conversionRate: calculateConversionRate(store.visits),
      createdAt: store.createdAt.toISOString(),
    }));

  return {
    data: mapped,
    total,
  };
}

export type CreateStoreResult = {
  store: Store;
  manager?: {
    email: string;
    appUserId: string;
  };
};

export async function createStore(input: CreateStoreInput): Promise<CreateStoreResult> {
  await ensureProductionStoreSchema();
  const { password, ...storeFields } = input;
  const normalizedCustomCategory =
    storeFields.category === "OTHER" ? storeFields.customCategory?.trim() : undefined;
  const managerEmail = storeFields.email?.trim().toLowerCase();

  let store: Store | undefined;
  try {
    store = await prisma.store.create({
      data: {
        name: storeFields.name.trim(),
        category: storeFields.category,
        customCategory: normalizedCustomCategory ?? null,
        city: storeFields.city.trim(),
        state: storeFields.state.trim(),
        pincode: storeFields.pincode ?? null,
        pocName: storeFields.pocName ?? null,
        pointOfContactPhone: storeFields.pointOfContactPhone ?? null,
        email: managerEmail ?? null,
      },
    });

    if (normalizedCustomCategory) {
      await prisma.storeCategoryOption.upsert({
        where: { name: normalizedCustomCategory },
        update: {},
        create: { name: normalizedCustomCategory },
      });
    }

    let manager: CreateStoreResult["manager"];
    if (password && managerEmail) {
      const invited = await inviteUser({
        name: storeFields.pocName?.trim() || store.name,
        email: managerEmail,
        password,
        role: "STORE_MANAGER",
        storeId: store.id,
      });
      manager = { email: invited.email, appUserId: invited.appUserId };
    }

    return { store: store!, manager };
  } catch (error) {
    if (store) {
      await prisma.store.delete({ where: { id: store.id } }).catch(() => undefined);
    }
    if (error instanceof InviteError) {
      throw error;
    }
    throw error;
  }
}

export async function updateStore(storeId: string, input: UpdateStoreInput) {
  const normalizedCustomCategory =
    input.category === "OTHER" ? input.customCategory?.trim() : undefined;
  const shouldClearCustomCategory = input.category && input.category !== "OTHER";

  const existing = await prisma.store.findFirst({
    where: mergeStoreWhere({ id: storeId }),
  });
  if (!existing) {
    throw new StoreServiceError("Store not found", 404);
  }

  const store = await prisma.store.update({
    where: { id: storeId },
    data: {
      ...input,
      customCategory: shouldClearCustomCategory ? null : normalizedCustomCategory,
    },
  });

  if (normalizedCustomCategory) {
    await prisma.storeCategoryOption.upsert({
      where: { name: normalizedCustomCategory },
      update: {},
      create: { name: normalizedCustomCategory },
    });
  }

  return store;
}

export class StoreServiceError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "StoreServiceError";
  }
}

export async function updateStoreManagerPassword(storeId: string, password: string) {
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.success) {
    throw new StoreServiceError(passwordCheck.error ?? "Invalid password", 400);
  }

  const store = await prisma.store.findFirst({
    where: mergeStoreWhere({ id: storeId }),
  });
  if (!store) {
    throw new StoreServiceError("Store not found", 404);
  }

  const manager = await prisma.appUser.findFirst({
    where: { storeId, role: "STORE_MANAGER" },
    orderBy: { createdAt: "asc" },
    select: { id: true, authId: true, email: true },
  });

  if (!manager) {
    throw new StoreServiceError(
      "No store manager login exists for this store. Add a manager email and password when creating the store.",
      404,
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(manager.authId, {
    password,
  });

  if (error) {
    throw new StoreServiceError(error.message ?? "Failed to update password", 502);
  }

  return { appUserId: manager.id, email: manager.email };
}

export type SoftDeleteStoreResult = {
  id: string;
  name: string;
  deletedAt: string;
  purgeAt: string;
};

export async function softDeleteStore(
  storeId: string,
  deletedByEmail: string,
): Promise<SoftDeleteStoreResult> {
  const store = await prisma.store.findFirst({
    where: mergeStoreWhere({ id: storeId }),
    include: {
      appUsers: {
        select: {
          id: true,
          authId: true,
          email: true,
          role: true,
          storeId: true,
          staffId: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  if (!store) {
    throw new StoreServiceError("Store not found", 404);
  }

  const now = new Date();
  const purgeAt = purgeAtFromNow(now);
  const supabase = createAdminClient();

  await prisma.$transaction([
    prisma.store.update({
      where: { id: storeId },
      data: {
        deletedAt: now,
        purgeAt,
        deletedByEmail: deletedByEmail.trim().toLowerCase(),
        isActive: false,
      },
    }),
    prisma.staff.updateMany({
      where: { storeId },
      data: { isActive: false },
    }),
    prisma.appUser.updateMany({
      where: { storeId },
      data: { isActive: false },
    }),
  ]);

  for (const manager of store.appUsers) {
    await supabase.auth.admin.updateUserById(manager.authId, {
      app_metadata: {
        role: manager.role,
        storeId: manager.storeId,
        staffId: manager.staffId,
        appUserId: manager.id,
        name: manager.name,
        storeName: store.name,
        employeeId: null,
        isActive: false,
      },
    });
  }

  void logAuthEvent({
    event: "STORE_SOFT_DELETED",
    email: deletedByEmail,
    metadata: {
      storeId,
      storeName: store.name,
      purgeAt: purgeAt.toISOString(),
      staffDeactivated: true,
      managersDeactivated: store.appUsers.length,
    },
  });

  return {
    id: store.id,
    name: store.name,
    deletedAt: now.toISOString(),
    purgeAt: purgeAt.toISOString(),
  };
}

export async function restoreStore(storeId: string): Promise<Store> {
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      deletedAt: { not: null },
      purgeAt: { gt: new Date() },
    },
    include: {
      appUsers: {
        select: {
          id: true,
          authId: true,
          email: true,
          role: true,
          storeId: true,
          staffId: true,
          name: true,
        },
      },
    },
  });

  if (!store) {
    throw new StoreServiceError(
      "Store not found, not deleted, or past the 90-day recovery window",
      404,
    );
  }

  const supabase = createAdminClient();

  const restored = await prisma.$transaction(async (tx) => {
    const updated = await tx.store.update({
      where: { id: storeId },
      data: {
        deletedAt: null,
        purgeAt: null,
        deletedByEmail: null,
        isActive: true,
      },
    });
    await tx.staff.updateMany({
      where: { storeId },
      data: { isActive: true },
    });
    await tx.appUser.updateMany({
      where: { storeId },
      data: { isActive: true },
    });
    return updated;
  });

  for (const manager of store.appUsers) {
    await supabase.auth.admin.updateUserById(manager.authId, {
      app_metadata: {
        role: manager.role,
        storeId: manager.storeId,
        staffId: manager.staffId,
        appUserId: manager.id,
        name: manager.name,
        storeName: store.name,
        employeeId: null,
        isActive: true,
      },
    });
  }

  void logAuthEvent({
    event: "STORE_RESTORED",
    email: store.deletedByEmail,
    metadata: { storeId, storeName: store.name },
  });

  return restored;
}

export async function getStoreById(storeId: string) {
  return prisma.store.findFirst({
    where: mergeStoreWhere({ id: storeId }),
    include: {
      _count: { select: { staff: true, visits: true, customers: true } },
    },
  });
}

export async function getStorePerformanceRows(
  period: AnalyticsPeriodLabel,
): Promise<StorePerformanceRow[]> {
  const { start, end } = getPeriodRange(period);
  const previousRange = getPreviousPeriodRange(period);

  const [stores, currentVisits, previousVisits] = await Promise.all([
    prisma.store.findMany({
      where: storeNotDeletedWhere,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        city: true,
        state: true,
        isActive: true,
        _count: { select: { staff: { where: { isActive: true } } } },
      },
    }),
    prisma.visit.findMany({
      where: { visitDate: { gte: start, lte: end }, store: storeNotDeletedWhere },
      select: { storeId: true, purchaseStatus: true, transactionAmount: true },
    }),
    prisma.visit.findMany({
      where: {
        visitDate: { gte: previousRange.start, lte: previousRange.end },
        store: storeNotDeletedWhere,
      },
      select: { storeId: true, purchaseStatus: true, transactionAmount: true },
    }),
  ]);

  const bucketVisits = (
    rows: Array<{
      storeId: string;
      purchaseStatus: PurchaseStatus;
      transactionAmount: number | null;
    }>,
  ) => {
    const map = new Map<
      string,
      Array<{ purchaseStatus: PurchaseStatus; transactionAmount: number | null }>
    >();
    for (const row of rows) {
      const list = map.get(row.storeId) ?? [];
      list.push(row);
      map.set(row.storeId, list);
    }
    return map;
  };

  const currentByStore = bucketVisits(currentVisits);
  const previousByStore = bucketVisits(previousVisits);

  return stores.map((store) => {
    const current = currentByStore.get(store.id) ?? [];
    const previous = previousByStore.get(store.id) ?? [];
    const visits = current.length;
    const revenue = calculateTotalRevenue(current);
    const conversionRate = calculateConversionRate(current);
    const previousVisits = previous.length;
    const previousRevenue = calculateTotalRevenue(previous);
    const previousConversion = calculateConversionRate(previous);

    return {
      storeId: store.id,
      storeName: store.name,
      category: store.category,
      city: store.city,
      state: store.state,
      isActive: store.isActive,
      visits,
      revenue,
      conversionRate,
      staffCount: store._count.staff,
      deltas: {
        visits: calculateDelta(visits, previousVisits),
        revenue: calculateDelta(revenue, previousRevenue),
        conversionRate: calculateDelta(conversionRate, previousConversion),
      },
    };
  });
}

