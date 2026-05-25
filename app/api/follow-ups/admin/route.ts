import { NextResponse } from "next/server";
import {
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { getAdminFollowUpOverview } from "@/lib/services/follow-ups";

export async function GET() {
  const session = await getServerSession();
  if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

  const data = await getAdminFollowUpOverview();
  return NextResponse.json(data);
}
