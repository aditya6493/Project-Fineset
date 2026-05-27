import type { Metadata } from "next";
import { content } from "@/content/en";
import { PortalShell } from "@/components/layout/PortalShell";
import { RealtimeSyncProvider } from "@/components/layout/RealtimeSyncProvider";
import { requirePortalSession } from "@/lib/auth/require-portal-session";

export const metadata: Metadata = {
  title: "Store Dashboard | FineSet",
  robots: { index: false, follow: false },
};

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePortalSession("STORE_MANAGER");

  const nav = content.store.nav;

  return (
    <PortalShell
      title={content.store.shell.title}
      signOutLabel={content.common.signOut}
      navItems={[
        { href: "/store/dashboard", label: nav.overview },
        { href: "/store/dashboard/visits", label: nav.visits },
        { href: "/store/dashboard/calls", label: nav.calls },
        { href: "/store/dashboard/field-sales", label: nav.fieldSales },
        { href: "/store/dashboard/staff", label: nav.staff },
      ]}
    >
      <RealtimeSyncProvider>{children}</RealtimeSyncProvider>
    </PortalShell>
  );
}
