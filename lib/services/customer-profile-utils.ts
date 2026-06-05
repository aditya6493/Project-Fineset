import type { CustomerType } from "@prisma/client";

/** Segment from actual visit history in the database. */
export function deriveProfileCustomerType(
  visits: Array<{ customerType: CustomerType }>,
): CustomerType | null {
  if (visits.length === 0) return null;
  if (visits.some((visit) => visit.customerType === "VIP")) return "VIP";
  if (visits.length >= 2) return "REPEAT";
  return "NEW";
}

/** Staff-selected type on the most recent visit (may differ from profile segment). */
export function getLatestVisitCustomerType(
  visits: Array<{ customerType: CustomerType }>,
): CustomerType | null {
  return visits[0]?.customerType ?? null;
}

export function customerTypesDiffer(
  profileType: CustomerType | null,
  latestVisitType: CustomerType | null,
): boolean {
  return (
    profileType != null &&
    latestVisitType != null &&
    profileType !== latestVisitType
  );
}

export function earliestActivityDate(
  dates: Array<Date | string | null | undefined>,
  fallback: Date,
): Date {
  const timestamps = dates
    .filter((d): d is Date | string => d != null)
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t));

  if (timestamps.length === 0) return fallback;
  return new Date(Math.min(fallback.getTime(), ...timestamps));
}
