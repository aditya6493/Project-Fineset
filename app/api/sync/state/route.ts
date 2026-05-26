import { NextResponse } from "next/server";
import { getServerSession, requireRole, unauthorized } from "@/lib/auth/session";
import { getSyncState } from "@/lib/services/sync";

export async function GET() {
  const session = await getServerSession();
  if (!requireRole(session, ["STAFF", "STORE_MANAGER", "MASTER_ADMIN"])) {
    return unauthorized();
  }

  const state = await getSyncState(session);

  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
