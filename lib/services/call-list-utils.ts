import type {
  StaffCallQueue,
  StaffCallSegment,
  StaffCallValueTier,
} from "@/types";
import type { BudgetRange, CustomerType, PurchaseStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/utils/formatters";

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

export function matchesCallSegment(
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

export function matchesCallValueTier(
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

export function matchesCallQueue(
  visit: {
    staffId: string;
    followUp: {
      status: string;
      assignedStaffId: string;
    } | null;
    callLogs: Array<{ answered: "ANSWERED" | "NOT_ANSWERED"; staffId?: string }>;
  },
  queue: StaffCallQueue,
): boolean {
  if (queue === "ALL") return true;

  const hasOpenFollowUp =
    visit.followUp?.status === "OPEN" &&
    visit.followUp.assignedStaffId === visit.staffId;
  const lastCall =
    visit.callLogs.find((log) => log.staffId === visit.staffId) ??
    visit.callLogs[0];

  if (queue === "FOLLOW_UP") {
    return hasOpenFollowUp || lastCall?.answered === "NOT_ANSWERED";
  }

  return !hasOpenFollowUp && lastCall?.answered !== "NOT_ANSWERED";
}

export function matchesVisitPeriod(
  visitDate: Date,
  year: number,
  month: number,
): boolean {
  return visitDate.getFullYear() === year && visitDate.getMonth() + 1 === month;
}

export function buildVisitCallSummary(visit: {
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

export function maskCustomerDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) {
    const part = parts[0];
    return part.length <= 2 ? `${part.charAt(0)}*` : `${part.slice(0, 2)}***`;
  }

  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}
