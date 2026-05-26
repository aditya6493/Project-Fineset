import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { getAdminStoreDetailAnalytics } from "@/lib/services/analytics";
import { getAnalyticsQuerySchema } from "@/lib/validations/analytics.schema";

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  const session = await getServerSession();
  if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

  const { storeId } = await context.params;
  const { searchParams } = new URL(req.url);
  const query = getAnalyticsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!query.success) return badRequest(query.error.flatten());

  try {
    const data = await getAdminStoreDetailAnalytics(storeId, query.data.period);
    return NextResponse.json(data);
  } catch {
    return notFound("Store not found");
  }
}
