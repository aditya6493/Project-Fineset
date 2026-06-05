import { PWA_CONFIG } from "@/lib/pwa/config";

/**
 * Ensures standalone / cold launch never shows an empty white viewport
 * while RSC redirects and client hydration complete.
 */
export function PwaLoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-pwa-shell
      className="min-h-screen bg-surface-primary"
      style={{ backgroundColor: PWA_CONFIG.backgroundColor }}
    >
      {children}
    </div>
  );
}
