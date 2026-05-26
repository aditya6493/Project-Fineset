import { content } from "@/content/en";
import { PortalShell } from "@/components/layout/PortalShell";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      {children}
    </PortalShell>
  );
}
