import type { Metadata } from "next";
import { Suspense } from "react";
import { content } from "@/content/en";
import { RealtimeSyncProvider } from "@/components/layout/RealtimeSyncProvider";
import { StoreDashboardProvider } from "@/components/store/StoreDashboardProvider";
import { StoreDashboardShell } from "@/components/store/StoreDashboardShell";
import { requirePortalSession } from "@/lib/auth/require-portal-session";

export const metadata: Metadata = {
  title: "Store Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePortalSession("STORE_MANAGER");

  return (
    <Suspense fallback={null}>
      <StoreDashboardProvider>
        <StoreDashboardShell
          title={content.store.shell.title}
          signOutLabel={content.common.signOut}
        >
          <RealtimeSyncProvider>{children}</RealtimeSyncProvider>
        </StoreDashboardShell>
      </StoreDashboardProvider>
    </Suspense>
  );
}
