"use client";

import { useEffect } from "react";
import { PWA_ASSET_VERSION } from "@/lib/pwa/config";

const STORAGE_KEY = "fineset-pwa-asset-version";

/**
 * When icon assets change, unregister the service worker and clear caches once,
 * then reload so install icons and precached logos update.
 */
export function PwaAssetRefresh() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === PWA_ASSET_VERSION) return;

    async function refreshAssets() {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
      } finally {
        localStorage.setItem(STORAGE_KEY, PWA_ASSET_VERSION);
        if (stored !== null) {
          window.location.reload();
        }
      }
    }

    void refreshAssets();
  }, []);

  return null;
}
