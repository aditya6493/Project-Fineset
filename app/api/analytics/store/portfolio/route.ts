import { NextResponse } from "next/server";
import { withAuthQuery } from "@/lib/api/route-handler";
import { getStoreManagerPortfolio } from "@/lib/services/analytics";
import { getAnalyticsQuerySchema } from "@/lib/validations/analytics.schema";

export const GET = withAuthQuery(
  ["BUSINESS_OWNER"] as const,
  getAnalyticsQuerySchema,
  async (session, query) => {
    const data = await getStoreManagerPortfolio(
      session.email,
      session.storeId,
      query.period,
    );
    return NextResponse.json(data);
  },
);
