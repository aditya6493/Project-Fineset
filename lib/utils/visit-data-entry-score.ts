import type {
  BudgetRange,
  FieldDeclineReason,
  IntentTier,
  PurchaseStatus,
  SchemeEnrollmentOutcome,
  SchemeProduct,
} from "@prisma/client";

export interface VisitDataEntryInput {
  purchaseStatus: PurchaseStatus;
  outTime: Date | null;
  area: string | null;
  gender: string | null;
  ageGroup: string | null;
  productsPurchased: string[];
  productsExplored: string[];
  transactionAmount: number | null;
  intentTier: IntentTier | null;
  reasonNoPurchase: string | null;
  competitorMention: string | null;
  purchaseOccasion: string | null;
  metalKtPref: string | null;
  budgetStated: BudgetRange | null;
  schemesPitched: SchemeProduct[];
  enrollmentOutcome: SchemeEnrollmentOutcome | null;
  monthlyCommitment: number | null;
  reasonNoEnrollment: FieldDeclineReason | null;
  schemeCompetitorMention: string | null;
  followUpNeeded: boolean;
  followUpDate: Date | null;
  staffNotes: string | null;
}

type TrackableField = keyof VisitDataEntryInput;

function getApplicableFields(visit: VisitDataEntryInput): TrackableField[] {
  const noSchemesPitched = visit.schemesPitched.includes("NONE");
  const fields: TrackableField[] = [
    "outTime",
    "area",
    "gender",
    "ageGroup",
    "schemesPitched",
    "intentTier",
    "purchaseOccasion",
    "metalKtPref",
    "budgetStated",
    "staffNotes",
  ];

  if (!noSchemesPitched) {
    fields.push("enrollmentOutcome");
  }

  if (visit.purchaseStatus === "PURCHASED") {
    fields.push("productsPurchased", "transactionAmount");
  } else if (visit.purchaseStatus === "NOT_PURCHASED") {
    fields.push("productsExplored", "reasonNoPurchase", "competitorMention");
  }

  const outcome = visit.enrollmentOutcome;
  if (
    !noSchemesPitched &&
    (outcome === "ENROLLED_GHS" ||
      outcome === "ENROLLED_GPP" ||
      outcome === "ENROLLED_BOTH")
  ) {
    fields.push("monthlyCommitment");
  }

  if (
    !noSchemesPitched &&
    (outcome === "DECLINED" || outcome === "CALLBACK")
  ) {
    fields.push("reasonNoEnrollment", "schemeCompetitorMention");
  }

  if (visit.followUpNeeded) {
    fields.push("followUpDate");
  }

  return fields;
}

function isFieldFilled(visit: VisitDataEntryInput, field: TrackableField): boolean {
  const value = visit[field];

  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (value instanceof Date) {
    return true;
  }

  return true;
}

export function calculateVisitDataEntryScore(visit: VisitDataEntryInput): number {
  const applicable = getApplicableFields(visit);
  if (applicable.length === 0) {
    return 100;
  }

  const filled = applicable.filter((field) => isFieldFilled(visit, field)).length;
  return Math.round((filled / applicable.length) * 100);
}

export function calculateAverageDataEntryScore(visits: VisitDataEntryInput[]): number {
  if (visits.length === 0) {
    return 0;
  }

  const total = visits.reduce(
    (sum, visit) => sum + calculateVisitDataEntryScore(visit),
    0,
  );
  return Math.round(total / visits.length);
}
