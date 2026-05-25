import { NextResponse } from "next/server";
import { getStaffPerformance } from "@/lib/services/staff";
import {
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const storeId =
    session.role === "STORE_MANAGER"
      ? session.storeId
      : searchParams.get("storeId") ?? undefined;

  const data = await getStaffPerformance(storeId);
  return NextResponse.json(data);
}
