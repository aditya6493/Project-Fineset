import { PWA_ASSET_VERSION } from "@/lib/pwa/config";

export const PWA_ASSET_STORAGE_KEY = "fineset-pwa-asset-version";

export type PwaAssetRefreshAction = "none" | "init" | "bump";

export interface PwaAssetRefreshDeps {
  getStoredVersion: () => string | null;
  setStoredVersion: (version: string) => void;
  unregisterServiceWorkers: () => Promise<void>;
  clearCaches: () => Promise<void>;
  reload: () => void;
}

/** Pure decision logic for PwaAssetRefresh (testable without DOM). */
export function getPwaAssetRefreshAction(stored: string | null): PwaAssetRefreshAction {
  if (stored === PWA_ASSET_VERSION) return "none";
  if (stored === null) return "init";
  return "bump";
}

export async function runPwaAssetRefresh(deps: PwaAssetRefreshDeps): Promise<void> {
  const stored = deps.getStoredVersion();
  const action = getPwaAssetRefreshAction(stored);
  if (action === "none") return;

  if (action === "bump") {
    try {
      await deps.unregisterServiceWorkers();
      await deps.clearCaches();
    } catch {
      // Best-effort cache refresh
    }
  }

  deps.setStoredVersion(PWA_ASSET_VERSION);

  if (action === "bump") {
    deps.reload();
  }
}
