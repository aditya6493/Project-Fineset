export const COHORT_PIVOT_DIMENSIONS = [
  "customerType",
  "valueTier",
  "intentTier",
  "purchaseStatus",
  "sourceChannel",
  "gender",
  "ageGroup",
  "area",
  "visitType",
  "budgetRange",
  "productCategory",
  "schemeProduct",
  "enrollmentOutcome",
] as const;

export type CohortPivotDimension = (typeof COHORT_PIVOT_DIMENSIONS)[number];

export const COHORT_PIVOT_LABELS: Record<CohortPivotDimension, string> = {
  customerType: "Customer type",
  valueTier: "Value tier",
  intentTier: "Intent",
  purchaseStatus: "Purchase status",
  sourceChannel: "Visit source",
  gender: "Gender",
  ageGroup: "Age group",
  area: "Location",
  visitType: "Visit type",
  budgetRange: "Price band",
  productCategory: "Product category",
  schemeProduct: "Scheme type",
  enrollmentOutcome: "Enrollment outcome",
};
