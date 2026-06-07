import type { SchemeEnrollmentOutcome } from "@prisma/client";

const ENROLLED_OUTCOMES = new Set<SchemeEnrollmentOutcome>([
  "ENROLLED_GHS",
  "ENROLLED_GPP",
  "ENROLLED_BOTH",
]);

export function isFieldSaleEnrolled(
  outcome: SchemeEnrollmentOutcome | null | undefined,
): boolean {
  return outcome != null && ENROLLED_OUTCOMES.has(outcome);
}

export function calculateFieldEnrollmentPercent(
  enrolled: number,
  total: number,
): number {
  if (total === 0) return 0;
  return Math.round((enrolled / total) * 1000) / 10;
}

export function schemePitchLabel(schemes: string[]): string {
  if (schemes.includes("NONE")) return "None";
  const hasGhs = schemes.includes("GHS");
  const hasGpp = schemes.includes("GPP");
  if (hasGhs && hasGpp) return "GHS + JPP";
  if (hasGhs) return "GHS only";
  if (hasGpp) return "JPP only";
  return "No scheme pitched";
}
