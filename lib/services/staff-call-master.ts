import type { SourceChannel, StaffCallMasterFilter, StaffCallMasterSource } from "@/types";

/** Visit source channels treated as external / off-floor acquisition. */
export const EXTERNAL_SOURCE_CHANNELS: SourceChannel[] = [
  "REFERRAL",
  "SOCIAL_MEDIA",
  "INTERNET",
  "PHONE",
  "USER_CALLS",
  "TANISHQ_REF",
  "CARATLANE_REF",
  "OTHER",
];

export function classifyVisitMasterSource(sourceChannel: SourceChannel): StaffCallMasterSource {
  return sourceChannel === "ORGANIC_WALK_IN" ? "STORE_VISIT" : "EXTERNAL";
}

export function matchesMasterFilter(
  masterSource: StaffCallMasterSource,
  filter: StaffCallMasterFilter,
): boolean {
  if (filter === "ALL") return true;
  return masterSource === filter;
}
