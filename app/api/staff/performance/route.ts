import { NextResponse } from "next/server";
import { getStaffPerformance } from "@/lib/services/staff";
import { resolveStorePortalStoreId } from "@/lib/auth/resolve-manager-store-id";
import {
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["BUSINESS_OWNER", "MASTER_ADMIN"])) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  let storeId: string | undefined;

  if (session.role === "BUSINESS_OWNER") {
    const resolved = await resolveStorePortalStoreId(
      session,
      searchParams.get("storeId") ?? undefined,
    );
    if (resolved instanceof NextResponse) return resolved;
    storeId = resolved;
  } else {
    storeId = searchParams.get("storeId") ?? undefined;
  }

  const data = await getStaffPerformance(storeId);
  return NextResponse.json(data);
}
