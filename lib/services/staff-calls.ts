import { prisma } from "@/lib/db/prisma";
import type { StaffCallOutcomeInput } from "@/lib/validations/staff-calls.schema";
import type {
  StaffCallDialResult,
  StaffCallFilterCounts,
  StaffCallListItem,
  StaffCallListResponse,
  StaffCallOutcomeResult,
  StaffCallQueue,
  StaffCallSegment,
  StaffCallValueTier,
} from "@/types";
import type { BudgetRange, CustomerType, Prisma, PurchaseStatus } from "@prisma/client";
import { decryptVisitPii } from "@/lib/services/pii";
import { broadcastSyncEvent } from "@/lib/sync/broadcaster";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { maskCustomerDisplayName } from "@/lib/utils/pii-display";

interface ListStaffCallsParams {
  staffId: string;
  storeId: string;
  segment: StaffCallSegment;
  valueTier: StaffCallValueTier;
  queue: StaffCallQueue;
  year: number;
  month: number;
  page: number;
  pageSize: number;
}

interface RecordStaffCallOutcomeParams extends StaffCallOutcomeInput {
  visitId: string;
  staffId: string;
  storeId: string;
}

const visitListSelect = (staffId: string): Prisma.VisitSelect => ({
  id: true,
  visitDate: true,
  customerName: true,
  customerPhone: true,
  customerType: true,
  purchaseStatus: true,
  productsExplored: true,
  productsPurchased: true,
  transactionAmount: true,
  budgetStated: true,
  intentTier: true,
  reasonNoPurchase: true,
  staffNotes: true,
  followUp: {
    select: {
      id: true,
      status: true,
      followUpDate: true,
      assignedStaffId: true,
      notes: true,
    },
  },
  callLogs: {
    where: { staffId },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      answered: true,
      createdAt: true,
      feedback: true,
    },
  },
});

export { maskCustomerDisplayName } from "@/lib/utils/pii-display";

export function computeVisitValueTier(visit: {
  transactionAmount: number | null;
  budgetStated: BudgetRange | null;
  purchaseStatus: PurchaseStatus;
}): Exclude<StaffCallValueTier, "ALL"> {
  if (visit.transactionAmount != null) {
    if (visit.transactionAmount >= 50_000) return "HIGH";
    if (visit.transactionAmount >= 15_000) return "MID";
    return "LOW";
  }

  switch (visit.budgetStated) {
    case "ABOVE_1L":
    case "K50_1L":
      return "HIGH";
    case "K15_50K":
      return "MID";
    case "UNDER_15K":
      return "LOW";
    default:
      return visit.purchaseStatus === "PURCHASED" ? "MID" : "LOW";
  }
}

function matchesSegment(
  visit: { customerType: CustomerType; purchaseStatus: PurchaseStatus },
  segment: StaffCallSegment,
): boolean {
  switch (segment) {
    case "ALL":
      return true;
    case "NEW":
      return visit.customerType === "NEW";
    case "RETAINED":
      return visit.customerType === "REPEAT" || visit.customerType === "VIP";
    case "PURCHASED":
      return visit.purchaseStatus === "PURCHASED";
    case "NOT_PURCHASED":
      return visit.purchaseStatus === "NOT_PURCHASED";
  }
}

function matchesValueTier(
  visit: {
    transactionAmount: number | null;
    budgetStated: BudgetRange | null;
    purchaseStatus: PurchaseStatus;
  },
  valueTier: StaffCallValueTier,
): boolean {
  if (valueTier === "ALL") return true;
  return computeVisitValueTier(visit) === valueTier;
}

function matchesQueue(
  visit: {
    followUp: {
      status: string;
      assignedStaffId: string;
    } | null;
    callLogs: Array<{ answered: "ANSWERED" | "NOT_ANSWERED" }>;
  },
  queue: StaffCallQueue,
  staffId: string,
): boolean {
  if (queue === "ALL") return true;

  const hasOpenFollowUp =
    visit.followUp?.status === "OPEN" && visit.followUp.assignedStaffId === staffId;
  const lastCall = visit.callLogs[0];

  if (queue === "FOLLOW_UP") {
    return hasOpenFollowUp || lastCall?.answered === "NOT_ANSWERED";
  }

  return !hasOpenFollowUp && lastCall?.answered !== "NOT_ANSWERED";
}

function matchesVisitPeriod(
  visitDate: Date,
  year: number,
  month: number,
): boolean {
  return visitDate.getFullYear() === year && visitDate.getMonth() + 1 === month;
}

function getAvailableYears(
  visits: Awaited<ReturnType<typeof fetchStaffVisits>>,
): number[] {
  const years = new Set(visits.map((visit) => visit.visitDate.getFullYear()));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

function buildPeriodFilterContext(
  active: {
    segment: StaffCallSegment;
    valueTier: StaffCallValueTier;
    queue: StaffCallQueue;
    year: number;
  },
  staffId: string,
  month: number,
) {
  return (visit: Awaited<ReturnType<typeof fetchStaffVisits>>[number]) =>
    matchesSegment(visit, active.segment) &&
    matchesValueTier(visit, active.valueTier) &&
    matchesQueue(visit, active.queue, staffId) &&
    matchesVisitPeriod(visit.visitDate, active.year, month);
}

function buildVisitSummary(visit: {
  purchaseStatus: PurchaseStatus;
  productsExplored: string[];
  productsPurchased: string[];
  transactionAmount: number | null;
  reasonNoPurchase: string | null;
}): string {
  const productLabel =
    visit.purchaseStatus === "PURCHASED"
      ? visit.productsPurchased[0] ?? visit.productsExplored[0]
      : visit.productsExplored[0];

  const parts = [
    productLabel?.replace(/_/g, " ").toLowerCase(),
    visit.purchaseStatus === "PURCHASED" ? "Purchased" : "Not purchased",
  ].filter(Boolean);

  if (visit.transactionAmount != null) {
    parts.push(formatCurrency(visit.transactionAmount));
  } else if (visit.reasonNoPurchase) {
    parts.push(visit.reasonNoPurchase.replace(/_/g, " ").toLowerCase());
  }

  return parts.join(" · ");
}

function toListItem(
  visit: Prisma.VisitGetPayload<{ select: ReturnType<typeof visitListSelect> }>,
  staffId: string,
): StaffCallListItem {
  const decrypted = decryptVisitPii(visit);
  const valueTier = computeVisitValueTier(visit);
  const hasOpenFollowUp =
    visit.followUp?.status === "OPEN" && visit.followUp.assignedStaffId === staffId;
  const lastCall = visit.callLogs[0];
  const notes =
    lastCall?.feedback?.trim() ||
    visit.followUp?.notes?.trim() ||
    visit.staffNotes?.trim() ||
    null;

  return {
    visitId: visit.id,
    followUpId: visit.followUp?.id ?? null,
    displayName: maskCustomerDisplayName(decrypted.customerName),
    visitDate: visit.visitDate.toISOString(),
    visitDateLabel: formatDate(visit.visitDate),
    customerType: visit.customerType,
    purchaseStatus: visit.purchaseStatus,
    valueTier,
    visitSummary: buildVisitSummary(visit),
    queue: hasOpenFollowUp || lastCall?.answered === "NOT_ANSWERED" ? "FOLLOW_UP" : "RETENTION",
    followUpDueDate: visit.followUp?.followUpDate.toISOString() ?? null,
    lastCallStatus: lastCall?.answered ?? null,
    notes,
    canCall: decrypted.customerPhone.replace(/\D/g, "").length >= 10,
  };
}

async function fetchStaffVisits(
  staffId: string,
  storeId: string,
  year: number,
) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

  return prisma.visit.findMany({
    where: {
      staffId,
      storeId,
      visitDate: { gte: yearStart, lte: yearEnd },
    },
    orderBy: { visitDate: "desc" },
    select: visitListSelect(staffId),
  });
}

function countFilters(
  visits: Awaited<ReturnType<typeof fetchStaffVisits>>,
  staffId: string,
  active: {
    segment: StaffCallSegment;
    valueTier: StaffCallValueTier;
    queue: StaffCallQueue;
    year: number;
    month: number;
  },
): StaffCallFilterCounts {
  const segments: StaffCallSegment[] = [
    "ALL",
    "NEW",
    "RETAINED",
    "PURCHASED",
    "NOT_PURCHASED",
  ];
  const valueTiers: StaffCallValueTier[] = ["ALL", "HIGH", "MID", "LOW"];
  const queues: StaffCallQueue[] = ["ALL", "RETENTION", "FOLLOW_UP"];

  return {
    segments: segments.map((segment) => ({
      key: segment,
      count: visits.filter(
        (visit) =>
          matchesSegment(visit, segment) &&
          matchesValueTier(visit, active.valueTier) &&
          matchesQueue(visit, active.queue, staffId) &&
          matchesVisitPeriod(visit.visitDate, active.year, active.month),
      ).length,
    })),
    valueTiers: valueTiers.map((tier) => ({
      key: tier,
      count: visits.filter(
        (visit) =>
          matchesSegment(visit, active.segment) &&
          matchesValueTier(visit, tier) &&
          matchesQueue(visit, active.queue, staffId) &&
          matchesVisitPeriod(visit.visitDate, active.year, active.month),
      ).length,
    })),
    queues: queues.map((queue) => ({
      key: queue,
      count: visits.filter(
        (visit) =>
          matchesSegment(visit, active.segment) &&
          matchesValueTier(visit, active.valueTier) &&
          matchesQueue(visit, queue, staffId) &&
          matchesVisitPeriod(visit.visitDate, active.year, active.month),
      ).length,
    })),
    months: Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const matchesMonth = buildPeriodFilterContext(active, staffId, month);
      return {
        month,
        count: visits.filter(matchesMonth).length,
      };
    }),
    availableYears: getAvailableYears(visits),
  };
}

export async function listStaffCalls(
  params: ListStaffCallsParams,
): Promise<StaffCallListResponse> {
  const visits = await fetchStaffVisits(
    params.staffId,
    params.storeId,
    params.year,
  );

  const filtered = visits.filter(
    (visit) =>
      matchesSegment(visit, params.segment) &&
      matchesValueTier(visit, params.valueTier) &&
      matchesQueue(visit, params.queue, params.staffId) &&
      matchesVisitPeriod(visit.visitDate, params.year, params.month),
  );

  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  const pageItems = filtered.slice(start, start + params.pageSize);

  return {
    data: pageItems.map((visit) => toListItem(visit, params.staffId)),
    total,
    page: params.page,
    pageSize: params.pageSize,
    filters: countFilters(visits, params.staffId, {
      segment: params.segment,
      valueTier: params.valueTier,
      queue: params.queue,
      year: params.year,
      month: params.month,
    }),
    year: params.year,
    month: params.month,
  };
}

export async function revealStaffCallPhone(params: {
  visitId: string;
  staffId: string;
  storeId: string;
}): Promise<StaffCallDialResult | null> {
  const visit = await prisma.visit.findFirst({
    where: {
      id: params.visitId,
      staffId: params.staffId,
      storeId: params.storeId,
    },
    select: {
      customerName: true,
      customerPhone: true,
    },
  });

  if (!visit) return null;

  await prisma.phoneRevealLog.create({
    data: {
      visitId: params.visitId,
      staffId: params.staffId,
    },
  });

  const decrypted = decryptVisitPii(visit);
  const digits = decrypted.customerPhone.replace(/\D/g, "");
  if (digits.length < 10) return null;

  const normalized = digits.slice(-10);

  return {
    visitId: params.visitId,
    displayName: maskCustomerDisplayName(decrypted.customerName),
    phone: normalized,
    dialUrl: `tel:+91${normalized}`,
  };
}

export async function recordStaffCallOutcome(
  params: RecordStaffCallOutcomeParams,
): Promise<StaffCallOutcomeResult | null> {
  const visit = await prisma.visit.findFirst({
    where: {
      id: params.visitId,
      staffId: params.staffId,
      storeId: params.storeId,
    },
    include: {
      followUp: true,
    },
  });

  if (!visit) return null;

  return prisma.$transaction(async (tx) => {
    await tx.staffCallLog.create({
      data: {
        visitId: params.visitId,
        staffId: params.staffId,
        answered: params.answered,
        feedback: params.feedback,
      },
    });

    let followUpId = visit.followUp?.id ?? null;
    let queue: StaffCallQueue = "RETENTION";

    if (params.answered === "NOT_ANSWERED") {
      const followUpDate =
        visit.followUp?.followUpDate ??
        new Date(Date.now() + 24 * 60 * 60 * 1000);

      const followUp = visit.followUp
        ? await tx.followUp.update({
            where: { id: visit.followUp.id },
            data: {
              status: "OPEN",
              assignedStaffId: params.staffId,
              followUpDate,
              callOutcome: "NOT_ANSWERED",
              outcomeDate: new Date(),
              notes: params.feedback ?? visit.followUp.notes,
              reason: visit.followUp.reason ?? "Call not answered",
            },
          })
        : await tx.followUp.create({
            data: {
              visitId: params.visitId,
              assignedStaffId: params.staffId,
              followUpDate,
              status: "OPEN",
              callOutcome: "NOT_ANSWERED",
              outcomeDate: new Date(),
              notes: params.feedback,
              reason: "Call not answered",
            },
          });

      followUpId = followUp.id;
      queue = "FOLLOW_UP";
    } else {
      if (params.scheduleFollowUp && params.followUpDate) {
        const followUp = visit.followUp
          ? await tx.followUp.update({
              where: { id: visit.followUp.id },
              data: {
                status: "OPEN",
                assignedStaffId: params.staffId,
                followUpDate: params.followUpDate,
                callOutcome: "ANSWERED",
                outcomeDate: new Date(),
                notes: params.feedback ?? visit.followUp.notes,
                reason: visit.followUp.reason ?? "Follow-up after answered call",
              },
            })
          : await tx.followUp.create({
              data: {
                visitId: params.visitId,
                assignedStaffId: params.staffId,
                followUpDate: params.followUpDate,
                status: "OPEN",
                callOutcome: "ANSWERED",
                outcomeDate: new Date(),
                notes: params.feedback,
                reason: "Follow-up after answered call",
              },
            });

        followUpId = followUp.id;
        queue = "FOLLOW_UP";
      } else if (visit.followUp?.status === "OPEN") {
        const followUp = await tx.followUp.update({
          where: { id: visit.followUp.id },
          data: {
            status: "CLOSED",
            callOutcome: "ANSWERED",
            outcomeDate: new Date(),
            notes: params.feedback ?? visit.followUp.notes,
          },
        });
        followUpId = followUp.id;
      }

      await tx.visit.update({
        where: { id: params.visitId },
        data: {
          followUpNeeded: params.scheduleFollowUp ?? visit.followUpNeeded,
          followUpDate: params.scheduleFollowUp
            ? params.followUpDate
            : visit.followUpDate,
        },
      });
    }

    return {
      visitId: params.visitId,
      followUpId,
      queue,
      message:
        params.answered === "NOT_ANSWERED"
          ? "Moved to follow-up calls"
          : params.scheduleFollowUp
            ? "Follow-up scheduled"
            : "Call feedback saved",
    };
  }).then((result) => {
    broadcastSyncEvent(params.storeId, ["callLogs", "followUps", "visits"]);
    return result;
  });
}
