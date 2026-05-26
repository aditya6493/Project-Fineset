import { prisma } from "@/lib/db/prisma";
import type { AppSession } from "@/types";
import type { Prisma } from "@prisma/client";

export type SyncEntity =
  | "visits"
  | "fieldSales"
  | "staff"
  | "customers"
  | "followUps"
  | "callLogs"
  | "stores";

export interface SyncVersionPayload {
  version: string;
  scope: string;
  entities: SyncEntity[];
  lastChangedAt: string;
}

function resolveStoreScope(session: AppSession): string | undefined {
  if (session.role === "STAFF") return session.storeId;
  if (session.role === "STORE_MANAGER") return session.storeId;
  return undefined;
}

async function getMaxTimestamp(
  where: Prisma.VisitWhereInput | undefined,
): Promise<Date> {
  const agg = await prisma.visit.aggregate({
    where,
    _max: { updatedAt: true },
  });
  return agg._max.updatedAt ?? new Date(0);
}

export async function computeSyncVersion(
  session: AppSession,
  entities: SyncEntity[] = [
    "visits",
    "fieldSales",
    "staff",
    "customers",
    "followUps",
    "callLogs",
    "stores",
  ],
): Promise<SyncVersionPayload> {
  const storeId = resolveStoreScope(session);
  const scope = storeId ?? "all";

  const visitWhere: Prisma.VisitWhereInput | undefined = storeId
    ? { storeId }
    : undefined;
  const fieldSaleWhere: Prisma.FieldSaleWhereInput | undefined = storeId
    ? { storeId }
    : undefined;
  const staffWhere: Prisma.StaffWhereInput | undefined = storeId
    ? { storeId }
    : undefined;
  const customerWhere: Prisma.CustomerWhereInput | undefined = storeId
    ? { storeId }
    : undefined;
  const followUpWhere: Prisma.FollowUpWhereInput | undefined = storeId
    ? {
        OR: [
          { visit: { storeId } },
          { fieldSale: { storeId } },
        ],
      }
    : undefined;
  const callLogWhere: Prisma.StaffCallLogWhereInput | undefined = storeId
    ? { visit: { storeId } }
    : undefined;

  const timestamps: Date[] = [];

  if (entities.includes("visits")) {
    const agg = await prisma.visit.aggregate({
      where: visitWhere,
      _max: { updatedAt: true },
    });
    if (agg._max.updatedAt) timestamps.push(agg._max.updatedAt);
  }

  if (entities.includes("fieldSales")) {
    const agg = await prisma.fieldSale.aggregate({
      where: fieldSaleWhere,
      _max: { updatedAt: true },
    });
    if (agg._max.updatedAt) timestamps.push(agg._max.updatedAt);
  }

  if (entities.includes("staff")) {
    const agg = await prisma.staff.aggregate({
      where: staffWhere,
      _max: { updatedAt: true },
    });
    if (agg._max.updatedAt) timestamps.push(agg._max.updatedAt);
  }

  if (entities.includes("customers")) {
    const agg = await prisma.customer.aggregate({
      where: customerWhere,
      _max: { updatedAt: true },
    });
    if (agg._max.updatedAt) timestamps.push(agg._max.updatedAt);
  }

  if (entities.includes("followUps")) {
    const agg = await prisma.followUp.aggregate({
      where: followUpWhere,
      _max: { updatedAt: true },
    });
    if (agg._max.updatedAt) timestamps.push(agg._max.updatedAt);
  }

  if (entities.includes("callLogs")) {
    const agg = await prisma.staffCallLog.aggregate({
      where: callLogWhere,
      _max: { createdAt: true },
    });
    if (agg._max.createdAt) timestamps.push(agg._max.createdAt);
  }

  if (entities.includes("stores")) {
    const agg = storeId
      ? await prisma.store.aggregate({
          where: { id: storeId },
          _max: { updatedAt: true },
        })
      : await prisma.store.aggregate({ _max: { updatedAt: true } });
    if (agg._max.updatedAt) timestamps.push(agg._max.updatedAt);
  }

  const lastChangedAt =
    timestamps.length > 0
      ? new Date(Math.max(...timestamps.map((d) => d.getTime())))
      : new Date(0);

  const version = [scope, lastChangedAt.getTime(), entities.sort().join(",")].join(
    ":",
  );

  return {
    version,
    scope,
    entities,
    lastChangedAt: lastChangedAt.toISOString(),
  };
}

/** Lightweight version check for legacy /api/sync/state */
export async function getSyncState(session: AppSession) {
  const payload = await computeSyncVersion(session);
  return {
    version: payload.version,
    lastChangedAt: payload.lastChangedAt,
    scope: payload.scope,
    counts: {
      visits: 0,
      fieldSales: 0,
      staff: 0,
      customers: 0,
      followUps: 0,
      callLogs: 0,
      stores: 0,
    },
  };
}

export { getMaxTimestamp };
