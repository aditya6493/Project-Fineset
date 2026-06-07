import { computeVisitValueTier } from "@/lib/services/call-list-utils";
import type { StaffCallValueTier } from "@/types";
import type { BudgetRange, CallValueTier, PurchaseStatus } from "@prisma/client";

export interface VisitDenormInput {
  transactionAmount: number | null;
  budgetStated: BudgetRange | null;
  purchaseStatus: PurchaseStatus;
  dateOfBirth: Date | null | undefined;
  anniversary: Date | null | undefined;
}

export interface FieldSaleDenormInput {
  monthlyCommitment: number | null;
  dateOfBirth: Date | null | undefined;
  anniversary: Date | null | undefined;
}

export interface CallRecordDenormFields {
  callValueTier: CallValueTier;
  birthMonth: number | null;
  anniversaryMonth: number | null;
}

export function computeBirthMonth(date: Date | null | undefined): number | null {
  if (!date) return null;
  return date.getUTCMonth() + 1;
}

export function computeAnniversaryMonth(date: Date | null | undefined): number | null {
  if (!date) return null;
  return date.getUTCMonth() + 1;
}

export function computeCallValueTierFromVisit(
  visit: Pick<VisitDenormInput, "transactionAmount" | "budgetStated" | "purchaseStatus">,
): CallValueTier {
  return computeVisitValueTier(visit) as CallValueTier;
}

export function computeCallValueTierFromFieldSale(
  monthlyCommitment: number | null,
): CallValueTier {
  if (monthlyCommitment == null) return "LOW";
  if (monthlyCommitment >= 50_000) return "HIGH";
  if (monthlyCommitment >= 15_000) return "MID";
  return "LOW";
}

export function visitDenormFields(input: VisitDenormInput): CallRecordDenormFields {
  return {
    callValueTier: computeCallValueTierFromVisit(input),
    birthMonth: computeBirthMonth(input.dateOfBirth),
    anniversaryMonth: computeAnniversaryMonth(input.anniversary),
  };
}

export function fieldSaleDenormFields(input: FieldSaleDenormInput): CallRecordDenormFields {
  return {
    callValueTier: computeCallValueTierFromFieldSale(input.monthlyCommitment),
    birthMonth: computeBirthMonth(input.dateOfBirth),
    anniversaryMonth: computeAnniversaryMonth(input.anniversary),
  };
}

export function resolveStoredValueTier(
  stored: CallValueTier | null | undefined,
  computed: Exclude<StaffCallValueTier, "ALL">,
): Exclude<StaffCallValueTier, "ALL"> {
  return (stored ?? computed) as Exclude<StaffCallValueTier, "ALL">;
}
