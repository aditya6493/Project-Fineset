import { prisma } from "@/lib/db/prisma";
import type { FollowUpListItem, AdminFollowUpOverview } from "@/types";
import type { FollowUpStatus, Prisma } from "@prisma/client";
import { decryptVisitPii } from "@/lib/services/pii";

interface ListFollowUpsParams {
  storeId: string;
  status?: FollowUpStatus;
  overdue?: boolean;
}

export async function listFollowUps(
  params: ListFollowUpsParams,
): Promise<FollowUpListItem[]> {
  const where: Prisma.FollowUpWhereInput = {
    visit: { storeId: params.storeId },
  };

  if (params.status) {
    where.status = params.status;
  }

  if (params.overdue) {
    where.status = "OPEN";
    where.followUpDate = { lt: new Date() };
  }

  const followUps = await prisma.followUp.findMany({
    where,
    orderBy: { followUpDate: "asc" },
    include: {
      visit: {
        select: {
          customerName: true,
          customerPhone: true,
        },
      },
    },
  });

  const staffIds = Array.from(new Set(followUps.map((f) => f.assignedStaffId)));
  const staffMembers = await prisma.staff.findMany({
    where: { id: { in: staffIds } },
    select: { id: true, name: true },
  });
  const staffMap = new Map(staffMembers.map((s) => [s.id, s.name]));

  return followUps.map((f) => {
    const decrypted = decryptVisitPii({
      customerName: f.visit.customerName,
      customerPhone: f.visit.customerPhone,
    });
    return {
      id: f.id,
      visitId: f.visitId,
      customerName: decrypted.customerName,
      customerPhone: decrypted.customerPhone,
      assignedStaffName: staffMap.get(f.assignedStaffId) ?? "Unknown",
      followUpDate: f.followUpDate.toISOString(),
      reason: f.reason,
      callOutcome: f.callOutcome,
      status: f.status,
    };
  });
}

export async function updateFollowUpStatus(
  followUpId: string,
  storeId: string,
  status: FollowUpStatus,
) {
  const followUp = await prisma.followUp.findFirst({
    where: {
      id: followUpId,
      visit: { storeId },
    },
  });

  if (!followUp) return null;

  return prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status,
      outcomeDate: new Date(),
    },
  });
}

export async function getCrossStoreFollowUpSummary() {
  const [open, overdue, converted] = await Promise.all([
    prisma.followUp.count({ where: { status: "OPEN" } }),
    prisma.followUp.count({
      where: { status: "OPEN", followUpDate: { lt: new Date() } },
    }),
    prisma.followUp.count({ where: { status: "CONVERTED" } }),
  ]);

  return { open, overdue, converted };
}

export async function getAdminFollowUpOverview(): Promise<AdminFollowUpOverview> {
  const summary = await getCrossStoreFollowUpSummary();

  const overdueFollowUps = await prisma.followUp.findMany({
    where: {
      status: "OPEN",
      followUpDate: { lt: new Date() },
    },
    orderBy: { followUpDate: "asc" },
    take: 50,
    include: {
      visit: {
        select: {
          customerName: true,
          customerPhone: true,
          store: { select: { name: true } },
        },
      },
    },
  });

  const staffIds = Array.from(
    new Set(overdueFollowUps.map((f) => f.assignedStaffId)),
  );
  const staffMembers = await prisma.staff.findMany({
    where: { id: { in: staffIds } },
    select: { id: true, name: true },
  });
  const staffMap = new Map(staffMembers.map((s) => [s.id, s.name]));

  return {
    summary,
    overdueItems: overdueFollowUps.map((f) => {
      const decrypted = decryptVisitPii({
        customerName: f.visit.customerName,
        customerPhone: f.visit.customerPhone,
      });
      return {
        id: f.id,
        visitId: f.visitId,
        customerName: decrypted.customerName,
        customerPhone: decrypted.customerPhone,
        assignedStaffName: staffMap.get(f.assignedStaffId) ?? "Unknown",
        followUpDate: f.followUpDate.toISOString(),
        reason: f.reason,
        callOutcome: f.callOutcome,
        status: f.status,
        storeName: f.visit.store.name,
      };
    }),
  };
}
