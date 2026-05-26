import { prisma } from "@/lib/db/prisma";
import type { AppSession, SyncState } from "@/types";
import type { Prisma } from "@prisma/client";

function resolveStoreScope(session: AppSession): string | undefined {
  if (session.role === "STAFF") return session.storeId;
  if (session.role === "STORE_MANAGER") return session.storeId;
  return undefined;
}

function maxTimestamp(dates: Array<Date | null | undefined>): Date {
  const valid = dates.filter((date): date is Date => date instanceof Date);
  if (valid.length === 0) return new Date(0);
  return new Date(Math.max(...valid.map((date) => date.getTime())));
}

export async function getSyncState(session: AppSession): Promise<SyncState> {
  const storeId = resolveStoreScope(session);

  const visitWhere: Prisma.VisitWhereInput = storeId ? { storeId } : {};
  const fieldSaleWhere: Prisma.FieldSaleWhereInput = storeId ? { storeId } : {};
  const staffWhere: Prisma.StaffWhereInput = storeId ? { storeId } : {};
  const customerWhere: Prisma.CustomerWhereInput = storeId ? { storeId } : {};
  const followUpWhere: Prisma.FollowUpWhereInput = storeId
    ? { visit: { storeId } }
    : {};
  const callLogWhere: Prisma.StaffCallLogWhereInput = storeId
    ? { visit: { storeId } }
    : {};

  const [
    visitAgg,
    fieldSaleAgg,
    staffLatest,
    customerAgg,
    followUpAgg,
    callLogAgg,
    storeAgg,
    visitCount,
    fieldSaleCount,
    staffCount,
    customerCount,
    followUpCount,
    callLogCount,
    storeCount,
  ] = await Promise.all([
    prisma.visit.aggregate({
      where: visitWhere,
      _max: { updatedAt: true, createdAt: true },
    }),
    prisma.fieldSale.aggregate({
      where: fieldSaleWhere,
      _max: { updatedAt: true, createdAt: true },
    }),
    prisma.staff.findFirst({
      where: staffWhere,
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.customer.aggregate({
      where: customerWhere,
      _max: { updatedAt: true, createdAt: true },
    }),
    prisma.followUp.aggregate({
      where: followUpWhere,
      _max: { updatedAt: true, createdAt: true },
    }),
    prisma.staffCallLog.aggregate({
      where: callLogWhere,
      _max: { createdAt: true },
    }),
    storeId
      ? prisma.store.aggregate({
          where: { id: storeId },
          _max: { updatedAt: true, createdAt: true },
        })
      : prisma.store.aggregate({
          _max: { updatedAt: true, createdAt: true },
        }),
    prisma.visit.count({ where: visitWhere }),
    prisma.fieldSale.count({ where: fieldSaleWhere }),
    prisma.staff.count({ where: staffWhere }),
    prisma.customer.count({ where: customerWhere }),
    prisma.followUp.count({ where: followUpWhere }),
    prisma.staffCallLog.count({ where: callLogWhere }),
    storeId ? Promise.resolve(1) : prisma.store.count(),
  ]);

  const lastChangedAt = maxTimestamp([
    visitAgg._max.updatedAt,
    visitAgg._max.createdAt,
    fieldSaleAgg._max.updatedAt,
    fieldSaleAgg._max.createdAt,
    staffLatest?.createdAt,
    customerAgg._max.updatedAt,
    customerAgg._max.createdAt,
    followUpAgg._max.updatedAt,
    followUpAgg._max.createdAt,
    callLogAgg._max.createdAt,
    storeAgg._max.updatedAt,
    storeAgg._max.createdAt,
  ]);

  const version = [
    session.role,
    storeId ?? "all",
    lastChangedAt.getTime(),
    visitCount,
    fieldSaleCount,
    staffCount,
    customerCount,
    followUpCount,
    callLogCount,
    storeCount,
  ].join(":");

  return {
    version,
    lastChangedAt: lastChangedAt.toISOString(),
    scope: storeId ?? "all",
    counts: {
      visits: visitCount,
      fieldSales: fieldSaleCount,
      staff: staffCount,
      customers: customerCount,
      followUps: followUpCount,
      callLogs: callLogCount,
      stores: storeCount,
    },
  };
}
