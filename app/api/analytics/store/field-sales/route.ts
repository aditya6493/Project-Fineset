import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { getStoreFieldSaleAnalytics } from "@/lib/services/store-field-sale-analytics";
import { getAnalyticsQuerySchema } from "@/lib/validations/analytics.schema";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER"])) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = getAnalyticsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!query.success) return badRequest(query.error.flatten());

  const data = await getStoreFieldSaleAnalytics(session.storeId, query.data.period);
  return NextResponse.json(data);
}
