import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { getAdminBusinessAnalytics } from "@/lib/services/admin-business-analytics";
import { adminBusinessAnalyticsQuerySchema } from "@/lib/validations/admin-business-analytics.schema";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

  const { searchParams } = new URL(req.url);
  const parsed = adminBusinessAnalyticsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!parsed.success) return badRequest(parsed.error.flatten());

  const data = await getAdminBusinessAnalytics(parsed.data);
  return NextResponse.json(data);
}
