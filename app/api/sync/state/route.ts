import { NextResponse } from "next/server";
import { getServerSession, requireRole, unauthorized } from "@/lib/auth/session";
import { getSyncState } from "@/lib/services/sync";
import {
  getCachedSyncState,
  setCachedSyncState,
} from "@/lib/sync/state-cache";

export async function GET() {
  const session = await getServerSession();
  if (!requireRole(session, ["STAFF", "STORE_MANAGER", "MASTER_ADMIN"])) {
    return unauthorized();
  }

  const cached = getCachedSyncState(session);
  const state = cached ?? (await getSyncState(session));
  if (!cached) {
    setCachedSyncState(session, state);
  }

  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
