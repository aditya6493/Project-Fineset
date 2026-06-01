import { NextResponse } from "next/server";
import { getServerSession, requireRole, unauthorized } from "@/lib/auth/session";
import { getAdminBusinessAnalyticsFilterOptions } from "@/lib/services/admin-business-analytics";

export async function GET() {
  const session = await getServerSession();
  if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

  const data = await getAdminBusinessAnalyticsFilterOptions();
  return NextResponse.json(data);
}
