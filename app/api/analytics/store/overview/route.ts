import { NextResponse } from "next/server";
import { withAuthQuery } from "@/lib/api/route-handler";
import { resolveStoreManagerAnalyticsStoreId } from "@/lib/auth/resolve-manager-store-id";
import { createPerfTimer, logPerf } from "@/lib/perf/timing";
import { getStoreOverviewBundle } from "@/lib/services/store-overview-bundle";
import { getAnalyticsQuerySchema } from "@/lib/validations/analytics.schema";

export const GET = withAuthQuery(
  ["STORE_MANAGER"] as const,
  getAnalyticsQuerySchema,
  async (session, query) => {
    const timer = createPerfTimer();
    timer.mark("auth");

    const storeId = await resolveStoreManagerAnalyticsStoreId(
      session,
      query.storeId,
    );
    if (storeId instanceof NextResponse) return storeId;
    timer.mark("resolveStore");

    const bundle = await getStoreOverviewBundle(
      session.email,
      session.storeId,
      storeId,
      query.period,
    );
    timer.mark("bundle");

    logPerf("/api/analytics/store/overview", timer.finish());

    return NextResponse.json({
      period: query.period,
      storeId,
      ...bundle,
    });
  },
);
