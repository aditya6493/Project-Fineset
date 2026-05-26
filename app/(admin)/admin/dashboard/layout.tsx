import { content } from "@/content/en";
import { PortalShell } from "@/components/layout/PortalShell";
import { RealtimeSyncProvider } from "@/components/layout/RealtimeSyncProvider";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | FineSet",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = content.admin.nav;

  return (
    <PortalShell
      title={content.admin.shell.title}
      signOutLabel={content.common.signOut}
      navItems={[
        { href: "/admin/dashboard", label: nav.overview },
        { href: "/admin/dashboard/stores", label: nav.stores },
        { href: "/admin/dashboard/calls", label: nav.calls },
        { href: "/admin/dashboard/field-sales", label: nav.fieldSales },
        { href: "/admin/dashboard/staff", label: nav.staff },
      ]}
    >
      <RealtimeSyncProvider>{children}</RealtimeSyncProvider>
    </PortalShell>
  );
}
