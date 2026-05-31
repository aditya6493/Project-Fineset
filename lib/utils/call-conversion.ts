import type { FollowUpStatus, PurchaseStatus } from "@prisma/client";

export interface AnsweredCallForConversion {
  createdAt: Date;
  visit: {
    purchaseStatus: PurchaseStatus;
    customerPhoneHash: string;
    followUp: { status: FollowUpStatus } | null;
  };
}

/** Index purchased visit dates by customer phone hash (same store). */
export function buildPurchasedVisitsByPhone(
  visits: Array<{ customerPhoneHash: string; visitDate: Date }>,
): Map<string, Date[]> {
  const map = new Map<string, Date[]>();
  for (const visit of visits) {
    const list = map.get(visit.customerPhoneHash) ?? [];
    list.push(visit.visitDate);
    map.set(visit.customerPhoneHash, list);
  }
  for (const dates of map.values()) {
    dates.sort((a, b) => a.getTime() - b.getTime());
  }
  return map;
}

/**
 * True when an answered call is tied to a purchase outcome:
 * linked visit is PURCHASED, follow-up is CONVERTED, or the customer
 * has a later PURCHASED visit at the same store.
 */
export function isAnsweredCallConverted(
  call: AnsweredCallForConversion,
  purchasedByPhone: Map<string, Date[]>,
): boolean {
  if (call.visit.purchaseStatus === "PURCHASED") return true;
  if (call.visit.followUp?.status === "CONVERTED") return true;

  const purchaseDates = purchasedByPhone.get(call.visit.customerPhoneHash);
  if (!purchaseDates?.length) return false;

  const callTime = call.createdAt.getTime();
  return purchaseDates.some((visitDate) => visitDate.getTime() > callTime);
}

export function calculateCallToConversionPercent(
  answeredCalls: number,
  convertedAnsweredCalls: number,
): number {
  if (answeredCalls === 0) return 0;
  return Math.round((convertedAnsweredCalls / answeredCalls) * 1000) / 10;
}
