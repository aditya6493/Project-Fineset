import { Logo } from "@/components/shared/Logo";
import { OfflineActions } from "@/components/pwa/OfflineActions";
import { BRAND_NAME } from "@/lib/pwa/config";

export const metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-primary px-page-x text-center">
      <Logo size={48} linked={false} className="mb-6" />
      <h1 className="font-display text-2xl font-semibold text-text-primary">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-sm text-text-secondary">
        {BRAND_NAME} needs an internet connection for sign-in and live store data.
        Cached pages may still be available.
      </p>
      <OfflineActions />
    </main>
  );
}
