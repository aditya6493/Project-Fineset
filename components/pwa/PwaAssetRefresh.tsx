"use client";

import { useEffect } from "react";
import {
  PWA_ASSET_STORAGE_KEY,
  runPwaAssetRefresh,
} from "@/lib/pwa/asset-refresh";

/**
 * When icon assets change, unregister the service worker and clear caches once,
 * then reload so install icons and precached logos update.
 * First visit only records the version — no SW tear-down (avoids blank PWA launch).
 */
export function PwaAssetRefresh() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    void runPwaAssetRefresh({
      getStoredVersion: () => localStorage.getItem(PWA_ASSET_STORAGE_KEY),
      setStoredVersion: (version) =>
        localStorage.setItem(PWA_ASSET_STORAGE_KEY, version),
      unregisterServiceWorkers: async () => {
        if (!("serviceWorker" in navigator)) return;
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister()),
        );
      },
      clearCaches: async () => {
        if (!("caches" in window)) return;
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      },
      reload: () => window.location.reload(),
    });
  }, []);

  return null;
}
