import { content } from "@/content/en";
import { PortalShell } from "@/components/layout/PortalShell";
import { RealtimeSyncProvider } from "@/components/layout/RealtimeSyncProvider";
import { requirePortalSession } from "@/lib/auth/require-portal-session";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | FineSet",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePortalSession("MASTER_ADMIN");

  return (
    <PortalShell
      title={content.admin.shell.title}
      signOutLabel={content.common.signOut}
    >
      <RealtimeSyncProvider>{children}</RealtimeSyncProvider>
    </PortalShell>
  );
}
