import { content } from "@/content/en";
import { PortalShell } from "@/components/layout/PortalShell";
import { RealtimeSyncProvider } from "@/components/layout/RealtimeSyncProvider";
import { requirePortalSession } from "@/lib/auth/require-portal-session";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePortalSession("STAFF");

  return (
    <PortalShell
      title={content.staff.shell.title}
      signOutLabel={content.common.signOut}
    >
      <RealtimeSyncProvider>{children}</RealtimeSyncProvider>
    </PortalShell>
  );
}
