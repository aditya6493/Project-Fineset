import { content } from "@/content/en";
import { PortalShell } from "@/components/layout/PortalShell";

import type { Metadata } from "next";
import { RealtimeSyncProvider } from "@/components/layout/RealtimeSyncProvider";

export const metadata: Metadata = {
  title: "Staff Dashboard | FineSet",
  robots: { index: false, follow: false },
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      title={content.staff.shell.title}
      signOutLabel={content.common.signOut}
    >
      {children}
    </PortalShell>
  );
}
