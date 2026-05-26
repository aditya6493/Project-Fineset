import { apiFetch } from "@/lib/api/client";
import type { SyncState } from "@/types";

export async function getSyncState(): Promise<SyncState> {
  return apiFetch<SyncState>("/api/sync/state");
}
