import type { AdminBusinessAnalyticsQuery } from "@/lib/validations/admin-business-analytics.schema";

/** Sentinel for visits with missing / not captured field values. */
export const ANALYTICS_FILTER_NA = "NA" as const;

export const ANALYTICS_FILTER_KEYS = [
  "storeId",
  "staffId",
  "segment",
  "valueTier",
  "customerType",
  "intentTier",
  "purchaseStatus",
  "visitType",
  "sourceChannel",
  "gender",
  "ageGroup",
  "area",
  "budgetRange",
  "productCategory",
  "schemeProduct",
  "enrollmentOutcome",
  "schemeEnrolled",
] as const;

export type AnalyticsFilterKey = (typeof ANALYTICS_FILTER_KEYS)[number];

export function isAnalyticsFilterActive(
  query: AdminBusinessAnalyticsQuery,
  key: AnalyticsFilterKey,
): boolean {
  return query.activeFilters?.includes(key) ?? false;
}

export interface AnalyticsFilterDraft {
  enabled: Record<AnalyticsFilterKey, boolean>;
  values: Record<AnalyticsFilterKey, string>;
}

export function createEmptyFilterDraft(): AnalyticsFilterDraft {
  return {
    enabled: Object.fromEntries(
      ANALYTICS_FILTER_KEYS.map((key) => [key, false]),
    ) as Record<AnalyticsFilterKey, boolean>,
    values: Object.fromEntries(
      ANALYTICS_FILTER_KEYS.map((key) => [key, ""]),
    ) as Record<AnalyticsFilterKey, string>,
  };
}

export function buildActiveFiltersQuery(
  draft: AnalyticsFilterDraft,
): Pick<AdminBusinessAnalyticsQuery, "activeFilters"> &
  Partial<AdminBusinessAnalyticsQuery> {
  const activeFilters: AnalyticsFilterKey[] = [];
  const query: Partial<AdminBusinessAnalyticsQuery> = {};

  for (const key of ANALYTICS_FILTER_KEYS) {
    if (!draft.enabled[key]) continue;

    const value = draft.values[key]?.trim();
    if (!value || value === "ALL") continue;

    activeFilters.push(key);

    switch (key) {
      case "storeId":
        query.storeId = value;
        break;
      case "staffId":
        query.staffId = value;
        break;
      case "segment":
        query.segment = value as AdminBusinessAnalyticsQuery["segment"];
        break;
      case "valueTier":
        query.valueTier = value as AdminBusinessAnalyticsQuery["valueTier"];
        break;
      case "customerType":
        query.customerType = value as AdminBusinessAnalyticsQuery["customerType"];
        break;
      case "intentTier":
        query.intentTier = value as AdminBusinessAnalyticsQuery["intentTier"];
        break;
      case "purchaseStatus":
        query.purchaseStatus = value as AdminBusinessAnalyticsQuery["purchaseStatus"];
        break;
      case "visitType":
        query.visitType = value as AdminBusinessAnalyticsQuery["visitType"];
        break;
      case "sourceChannel":
        query.sourceChannel = value as AdminBusinessAnalyticsQuery["sourceChannel"];
        break;
      case "gender":
        query.gender = value as AdminBusinessAnalyticsQuery["gender"];
        break;
      case "ageGroup":
        query.ageGroup = value as AdminBusinessAnalyticsQuery["ageGroup"];
        break;
      case "area":
        query.area = value;
        break;
      case "budgetRange":
        query.budgetRange = value as AdminBusinessAnalyticsQuery["budgetRange"];
        break;
      case "productCategory":
        query.productCategory = value as AdminBusinessAnalyticsQuery["productCategory"];
        break;
      case "schemeProduct":
        query.schemeProduct = value as AdminBusinessAnalyticsQuery["schemeProduct"];
        break;
      case "enrollmentOutcome":
        query.enrollmentOutcome =
          value as AdminBusinessAnalyticsQuery["enrollmentOutcome"];
        break;
      case "schemeEnrolled":
        if (value === ANALYTICS_FILTER_NA) {
          query.schemeEnrolledNa = true;
        } else {
          query.schemeEnrolled = value === "true";
        }
        break;
    }
  }

  return {
    activeFilters,
    segment: (query.segment ?? "ALL") as AdminBusinessAnalyticsQuery["segment"],
    valueTier: (query.valueTier ?? "ALL") as AdminBusinessAnalyticsQuery["valueTier"],
    ...query,
  };
}
