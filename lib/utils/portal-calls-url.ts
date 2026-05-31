import { portalCallsQuerySchema } from "@/lib/validations/portal-calls.schema";
import type { GetPortalCallsParams } from "@/types";
import type { IntentTier } from "@prisma/client";

const INTENT_TIERS = new Set<IntentTier>(["HOT", "WARM", "COLD", "BROWSING"]);

export function parsePortalCallsSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): GetPortalCallsParams {
  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") raw[key] = value;
  }

  const parsed = portalCallsQuerySchema.safeParse(raw);
  const base = parsed.success ? parsed.data : portalCallsQuerySchema.parse({});

  const intentTierRaw = raw.intentTier;
  const intentTier =
    intentTierRaw && INTENT_TIERS.has(intentTierRaw as IntentTier)
      ? (intentTierRaw as IntentTier)
      : undefined;

  return {
    page: base.page,
    pageSize: base.pageSize,
    year: base.year,
    month: base.month,
    segment: base.segment,
    valueTier: base.valueTier,
    queue: base.queue,
    storeId: base.storeId,
    staffId: base.staffId,
    search: base.search,
    intentTier,
  };
}
