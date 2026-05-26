import { content } from "@/content/en";
import { PortalShell } from "@/components/layout/PortalShell";

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
      {children}
    </PortalShell>
  );
}
