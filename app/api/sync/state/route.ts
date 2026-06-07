import { NextResponse } from "next/server";
import { getServerSession, requireRole, unauthorized } from "@/lib/auth/session";
import { getSyncState } from "@/lib/services/sync";
import {
  getCachedSyncState,
  setCachedSyncState,
} from "@/lib/sync/state-cache";
import type { SyncState } from "@/types";

function fallbackSyncState(scope: string): SyncState {
  return {
    version: `${scope}:${Date.now()}:fallback`,
    lastChangedAt: new Date(0).toISOString(),
    scope,
    counts: {
      visits: 0,
      fieldSales: 0,
      staff: 0,
      customers: 0,
      followUps: 0,
      callLogs: 0,
      stores: 0,
    },
  };
}

export async function GET() {
  const startedAt = Date.now();
  try {
    const session = await getServerSession();
    if (!requireRole(session, ["STAFF", "STORE_MANAGER", "BUSINESS_OWNER", "MASTER_ADMIN"])) {
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
  } catch (error) {
    console.error("[api.sync.state] failed", {
      elapsedMs: Date.now() - startedAt,
      error,
    });
    // Keep portal usable when sync-state query fails.
    return NextResponse.json(fallbackSyncState("all"), {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }
}
