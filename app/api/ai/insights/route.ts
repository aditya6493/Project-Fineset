import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { getAdminAnalytics, getStoreAnalytics } from "@/lib/services/analytics";
import { generateInsights } from "@/lib/gemini/client";
import { getInsightsQuerySchema } from "@/lib/validations/analytics.schema";
import {
  checkAiInsightsRateLimit,
  getRequestIdentifier,
} from "@/lib/rate-limit";
import { content } from "@/content/en";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = getInsightsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!query.success) return badRequest(query.error.flatten());

  if (query.data.context === "store" && session.role !== "STORE_MANAGER") {
    return unauthorized();
  }
  if (query.data.context === "admin" && session.role !== "MASTER_ADMIN") {
    return unauthorized();
  }

  const identifier = await getRequestIdentifier();
  const rateLimit = await checkAiInsightsRateLimit(
    `${identifier}:${session.role}:${query.data.context}`,
  );
  if (!rateLimit.success) {
    return NextResponse.json(
      { message: content.errors.rateLimited },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const analyticsData =
    query.data.context === "store" && session.role === "STORE_MANAGER"
      ? await getStoreAnalytics(session.storeId, query.data.period)
      : await getAdminAnalytics(query.data.period);

  const insights = await generateInsights(analyticsData, query.data.context);
  return NextResponse.json(insights);
}
