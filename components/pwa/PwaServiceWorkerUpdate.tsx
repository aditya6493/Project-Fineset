"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * When a new service worker is waiting (skipWaiting: false in sw.ts),
 * offer a reload instead of forcing mid-navigation takeover.
 */
export function PwaServiceWorkerUpdate() {
  const [waiting, setWaiting] = useState(false);
  const applyingUpdateRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    function listenForWaiting(registration: ServiceWorkerRegistration) {
      if (registration.waiting) {
        setWaiting(true);
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaiting(true);
          }
        });
      });
    }

    void navigator.serviceWorker.ready.then(listenForWaiting);

    const onControllerChange = () => {
      if (!applyingUpdateRef.current) return;
      applyingUpdateRef.current = false;
      setWaiting(false);
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  const applyUpdate = useCallback(() => {
    applyingUpdateRef.current = true;
    void navigator.serviceWorker.ready.then((registration) => {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    });
  }, []);

  if (!waiting) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-lg items-center justify-between gap-3 rounded-card border border-border bg-surface-card px-4 py-3 shadow-card sm:inset-x-auto sm:right-6"
    >
      <p className="text-sm text-text-primary">A new version is ready.</p>
      <Button size="sm" onClick={applyUpdate}>
        Reload
      </Button>
    </div>
  );
}
