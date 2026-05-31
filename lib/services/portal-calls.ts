import { prisma } from "@/lib/db/prisma";
import type { PortalCallsQuery } from "@/lib/validations/portal-calls.schema";
import {
  buildVisitCallSummary,
  computeVisitValueTier,
  matchesCallIntentTier,
  matchesCallQueue,
  matchesCallSegment,
  matchesCallValueTier,
  matchesVisitPeriod,
} from "@/lib/services/call-list-utils";
import {
  maskCustomerDisplayName,
  maskCustomerPhone,
} from "@/lib/utils/pii-display";
import { decryptVisitPii } from "@/lib/services/pii";
import { formatDate } from "@/lib/utils/formatters";
import type {
  PortalCallListItem,
  PortalCallListResponse,
  StaffCallFilterCounts,
  StaffCallQueue,
  StaffCallSegment,
  StaffCallValueTier,
} from "@/types";
import type { Prisma } from "@prisma/client";

interface ListPortalCallsParams extends PortalCallsQuery {
  storeId?: string;
}

const portalVisitListSelect = (): Prisma.VisitSelect => ({
  id: true,
  staffId: true,
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
  staff: {
    select: {
      id: true,
      name: true,
    },
  },
  store: {
    select: {
      id: true,
      name: true,
    },
  },
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
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      staffId: true,
      answered: true,
      createdAt: true,
      feedback: true,
    },
  },
});

type PortalVisitRow = Prisma.VisitGetPayload<{
  select: ReturnType<typeof portalVisitListSelect>;
}>;

function getLastCallForStaff(visit: PortalVisitRow) {
  return (
    visit.callLogs.find((log) => log.staffId === visit.staffId) ??
    visit.callLogs[0] ??
    null
  );
}

function maskCustomerPhoneForPortal(phone: string): string {
  return maskCustomerPhone(phone);
}

function toPortalCallItem(visit: PortalVisitRow): PortalCallListItem {
  const decrypted = decryptVisitPii(visit);
  const valueTier = computeVisitValueTier(visit);
  const lastCall = getLastCallForStaff(visit);
  const hasOpenFollowUp =
    visit.followUp?.status === "OPEN" &&
    visit.followUp.assignedStaffId === visit.staffId;
  const notes =
    lastCall?.feedback?.trim() ||
    visit.followUp?.notes?.trim() ||
    visit.staffNotes?.trim() ||
    null;

  return {
    visitId: visit.id,
    followUpId: visit.followUp?.id ?? null,
    customerName: maskCustomerDisplayName(decrypted.customerName),
    customerPhone: maskCustomerPhoneForPortal(decrypted.customerPhone),
    staffId: visit.staff.id,
    staffName: visit.staff.name,
    storeId: visit.store.id,
    storeName: visit.store.name,
    visitDate: visit.visitDate.toISOString(),
    visitDateLabel: formatDate(visit.visitDate),
    customerType: visit.customerType,
    purchaseStatus: visit.purchaseStatus,
    valueTier,
    visitSummary: buildVisitCallSummary(visit),
    queue: hasOpenFollowUp || lastCall?.answered === "NOT_ANSWERED" ? "FOLLOW_UP" : "RETENTION",
    followUpDueDate: visit.followUp?.followUpDate.toISOString() ?? null,
    lastCallStatus: lastCall?.answered ?? null,
    notes,
  };
}

function matchesSearch(visit: PortalVisitRow, search?: string): boolean {
  if (!search?.trim()) return true;

  const decrypted = decryptVisitPii(visit);
  const term = search.trim().toLowerCase();
  const normalizedPhone = search.replace(/\D/g, "");

  if (decrypted.customerName.toLowerCase().includes(term)) return true;
  if (visit.staff.name.toLowerCase().includes(term)) return true;
  if (
    normalizedPhone.length >= 4 &&
    decrypted.customerPhone.replace(/\D/g, "").includes(normalizedPhone)
  ) {
    return true;
  }

  return false;
}

function getAvailableYears(visits: PortalVisitRow[]): number[] {
  const years = new Set(visits.map((visit) => visit.visitDate.getFullYear()));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

function countFilters(
  visits: PortalVisitRow[],
  active: {
    segment: StaffCallSegment;
    valueTier: StaffCallValueTier;
    queue: StaffCallQueue;
    year: number;
    month: number;
    staffId?: string;
    search?: string;
    intentTier?: import("@prisma/client").IntentTier;
  },
): StaffCallFilterCounts {
  const base = visits.filter(
    (visit) =>
      (!active.staffId || visit.staffId === active.staffId) &&
      matchesSearch(visit, active.search),
  );

  const segments: StaffCallSegment[] = [
    "ALL",
    "NEW",
    "RETAINED",
    "PURCHASED",
    "NOT_PURCHASED",
  ];
  const valueTiers: StaffCallValueTier[] = ["ALL", "HIGH", "MID", "LOW"];
  const queues: StaffCallQueue[] = ["ALL", "RETENTION", "FOLLOW_UP"];

  const withPeriod = (visit: PortalVisitRow, month: number) =>
    matchesCallSegment(visit, active.segment) &&
    matchesCallValueTier(visit, active.valueTier) &&
    matchesCallIntentTier(visit, active.intentTier) &&
    matchesCallQueue(
      { ...visit, callLogs: visit.callLogs.map((log) => ({ ...log })) },
      active.queue,
    ) &&
    matchesVisitPeriod(visit.visitDate, active.year, month);

  return {
    segments: segments.map((segment) => ({
      key: segment,
      count: base.filter(
        (visit) =>
          matchesCallSegment(visit, segment) &&
          matchesCallValueTier(visit, active.valueTier) &&
          matchesCallIntentTier(visit, active.intentTier) &&
          matchesCallQueue(visit, active.queue) &&
          matchesVisitPeriod(visit.visitDate, active.year, active.month),
      ).length,
    })),
    valueTiers: valueTiers.map((tier) => ({
      key: tier,
      count: base.filter(
        (visit) =>
          matchesCallSegment(visit, active.segment) &&
          matchesCallValueTier(visit, tier) &&
          matchesCallIntentTier(visit, active.intentTier) &&
          matchesCallQueue(visit, active.queue) &&
          matchesVisitPeriod(visit.visitDate, active.year, active.month),
      ).length,
    })),
    queues: queues.map((queue) => ({
      key: queue,
      count: base.filter(
        (visit) =>
          matchesCallSegment(visit, active.segment) &&
          matchesCallValueTier(visit, active.valueTier) &&
          matchesCallIntentTier(visit, active.intentTier) &&
          matchesCallQueue(visit, queue) &&
          matchesVisitPeriod(visit.visitDate, active.year, active.month),
      ).length,
    })),
    months: Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return {
        month,
        count: base.filter((visit) => withPeriod(visit, month)).length,
      };
    }),
    availableYears: getAvailableYears(base),
  };
}

async function fetchPortalVisits(storeId?: string) {
  return prisma.visit.findMany({
    where: storeId ? { storeId } : undefined,
    orderBy: { visitDate: "desc" },
    select: portalVisitListSelect(),
  });
}

export async function listPortalCalls(
  params: ListPortalCallsParams,
): Promise<PortalCallListResponse> {
  const visits = await fetchPortalVisits(params.storeId);

  const filtered = visits.filter(
    (visit) =>
      (!params.staffId || visit.staffId === params.staffId) &&
      matchesSearch(visit, params.search) &&
      matchesCallSegment(visit, params.segment) &&
      matchesCallValueTier(visit, params.valueTier) &&
      matchesCallIntentTier(visit, params.intentTier) &&
      matchesCallQueue(visit, params.queue) &&
      matchesVisitPeriod(visit.visitDate, params.year, params.month),
  );

  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  const pageItems = filtered.slice(start, start + params.pageSize);

  return {
    data: pageItems.map(toPortalCallItem),
    total,
    page: params.page,
    pageSize: params.pageSize,
    year: params.year,
    month: params.month,
    filters: countFilters(visits, {
      segment: params.segment,
      valueTier: params.valueTier,
      queue: params.queue,
      year: params.year,
      month: params.month,
      staffId: params.staffId,
      search: params.search,
      intentTier: params.intentTier,
    }),
  };
}
