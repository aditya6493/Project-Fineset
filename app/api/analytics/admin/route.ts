import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { getAdminDashboardOverview } from "@/lib/services/analytics";
import { getAnalyticsQuerySchema } from "@/lib/validations/analytics.schema";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = getAnalyticsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!query.success) return badRequest(query.error.flatten());

  const data = await getAdminDashboardOverview(query.data.period);
  return NextResponse.json(data);
}
