import type { SchemeEnrollmentOutcome } from "@prisma/client";

export function resolveSchemeEnrollmentFlags(outcome?: SchemeEnrollmentOutcome | null): {
  schemeEnrolled: boolean;
  ghsPolicy: boolean;
  activeScheme: string | null;
} {
  switch (outcome) {
    case "ENROLLED_GHS":
      return { schemeEnrolled: true, ghsPolicy: true, activeScheme: "GHS" };
    case "ENROLLED_GPP":
      return { schemeEnrolled: true, ghsPolicy: false, activeScheme: "GPP" };
    case "ENROLLED_BOTH":
      return { schemeEnrolled: true, ghsPolicy: true, activeScheme: "GHS+GPP" };
    default:
      return { schemeEnrolled: false, ghsPolicy: false, activeScheme: null };
  }
}
