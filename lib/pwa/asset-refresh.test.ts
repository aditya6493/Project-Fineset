import { describe, expect, it, vi } from "vitest";
import {
  getPwaAssetRefreshAction,
  runPwaAssetRefresh,
} from "@/lib/pwa/asset-refresh";
import { PWA_ASSET_VERSION } from "@/lib/pwa/config";

describe("getPwaAssetRefreshAction", () => {
  it("returns none when version matches", () => {
    expect(getPwaAssetRefreshAction(PWA_ASSET_VERSION)).toBe("none");
  });

  it("returns init on first visit", () => {
    expect(getPwaAssetRefreshAction(null)).toBe("init");
  });

  it("returns bump when version changes", () => {
    expect(getPwaAssetRefreshAction("1")).toBe("bump");
  });
});

describe("runPwaAssetRefresh", () => {
  function createDeps(stored: string | null) {
    return {
      getStoredVersion: vi.fn().mockReturnValue(stored),
      setStoredVersion: vi.fn(),
      unregisterServiceWorkers: vi.fn().mockResolvedValue(undefined),
      clearCaches: vi.fn().mockResolvedValue(undefined),
      reload: vi.fn(),
    };
  }

  it("first visit: sets storage without unregister or reload", async () => {
    const deps = createDeps(null);
    await runPwaAssetRefresh(deps);

    expect(deps.setStoredVersion).toHaveBeenCalledWith(PWA_ASSET_VERSION);
    expect(deps.unregisterServiceWorkers).not.toHaveBeenCalled();
    expect(deps.clearCaches).not.toHaveBeenCalled();
    expect(deps.reload).not.toHaveBeenCalled();
  });

  it("same version: no side effects", async () => {
    const deps = createDeps(PWA_ASSET_VERSION);
    await runPwaAssetRefresh(deps);

    expect(deps.setStoredVersion).not.toHaveBeenCalled();
    expect(deps.unregisterServiceWorkers).not.toHaveBeenCalled();
  });

  it("version bump: unregisters SW, clears caches, reloads", async () => {
    const deps = createDeps("old-version");
    await runPwaAssetRefresh(deps);

    expect(deps.unregisterServiceWorkers).toHaveBeenCalled();
    expect(deps.clearCaches).toHaveBeenCalled();
    expect(deps.setStoredVersion).toHaveBeenCalledWith(PWA_ASSET_VERSION);
    expect(deps.reload).toHaveBeenCalled();
  });
});
