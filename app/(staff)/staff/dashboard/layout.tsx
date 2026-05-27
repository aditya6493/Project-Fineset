import { content } from "@/content/en";
import { PortalShell } from "@/components/layout/PortalShell";
import { requirePortalSession } from "@/lib/auth/require-portal-session";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Dashboard | FineSet",
  robots: { index: false, follow: false },
};

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
      {children}
    </PortalShell>
  );
}
