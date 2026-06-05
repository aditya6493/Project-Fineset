"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { PWA_CONFIG } from "@/lib/pwa/config";
import { isStandaloneDisplay } from "@/lib/pwa/standalone";

const DISMISS_KEY = "fineset-pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setDeferredPrompt(null);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setVisible(false);

    if (outcome === "dismissed") {
      sessionStorage.setItem(DISMISS_KEY, "1");
    }
  }, [deferredPrompt]);

  if (!visible || !deferredPrompt) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Install app"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-card border border-border bg-surface-card p-4 shadow-card sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <Logo size={40} linked={false} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary">
            Install {PWA_CONFIG.shortName}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Add to your home screen for faster access and an app-like experience.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={install}>
              Install
            </Button>
            <Button size="sm" variant="outline" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
