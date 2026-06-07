import type { Metadata } from "next";
import { Suspense } from "react";
import { content } from "@/content/en";
import { RealtimeSyncProvider } from "@/components/layout/RealtimeSyncProvider";
import { StoreDashboardProvider } from "@/components/store/StoreDashboardProvider";
import { StoreDashboardShell } from "@/components/store/StoreDashboardShell";
import { requirePortalSession } from "@/lib/auth/require-portal-session";

export const metadata: Metadata = {
  title: "Store Manager Portal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StoreManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePortalSession(["STORE_MANAGER"]);

  return (
    <Suspense fallback={null}>
      <StoreDashboardProvider
        portalRole={session.role}
        assignedStoreId={session.storeId}
      >
        <StoreDashboardShell
          title={content.store.managerShell.title}
          signOutLabel={content.common.signOut}
        >
          <RealtimeSyncProvider>{children}</RealtimeSyncProvider>
        </StoreDashboardShell>
      </StoreDashboardProvider>
    </Suspense>
  );
}
