import { prisma } from "@/lib/db/prisma";
import type { CreateStoreInput, UpdateStoreInput } from "@/lib/validations/store.schema";
import type { StorePerformanceRow } from "@/types";
import type { Prisma } from "@prisma/client";
import {
  calculateConversionRate,
  calculateTotalRevenue,
  getPeriodRange,
} from "@/lib/utils/analytics";

export async function listStores(params: {
  page: number;
  pageSize: number;
  search?: string;
  activeOnly?: boolean;
}) {
  const where: Prisma.StoreWhereInput = {};

  if (params.activeOnly) {
    where.isActive = true;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { city: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const { start, end } = getPeriodRange("month");

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
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
    }),
    prisma.store.count({ where }),
  ]);

  return {
    data: stores.map((store) => ({
      id: store.id,
      name: store.name,
      city: store.city,
      state: store.state,
      pincode: store.pincode,
      isActive: store.isActive,
      staffCount: store._count.staff,
      revenueMtd: calculateTotalRevenue(store.visits),
      conversionRate: calculateConversionRate(store.visits),
      createdAt: store.createdAt.toISOString(),
    })),
    total,
  };
}

export async function createStore(input: CreateStoreInput) {
  return prisma.store.create({ data: input });
}

export async function updateStore(storeId: string, input: UpdateStoreInput) {
  return prisma.store.update({
    where: { id: storeId },
    data: input,
  });
}

export async function getStoreById(storeId: string) {
  return prisma.store.findUnique({
    where: { id: storeId },
    include: {
      _count: { select: { staff: true, visits: true, customers: true } },
    },
  });
}

export async function getStoreRankings(): Promise<StorePerformanceRow[]> {
  const { start, end } = getPeriodRange("month");

  const stores = await prisma.store.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { staff: true } },
      visits: {
        where: { visitDate: { gte: start, lte: end } },
        select: { purchaseStatus: true, transactionAmount: true },
      },
    },
  });

  return stores
    .map((store) => ({
      storeId: store.id,
      storeName: store.name,
      city: store.city,
      visits: store.visits.length,
      revenue: calculateTotalRevenue(store.visits),
      conversionRate: calculateConversionRate(store.visits),
      staffCount: store._count.staff,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}
