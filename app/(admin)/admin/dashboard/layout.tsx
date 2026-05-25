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
        { href: "/admin/dashboard/staff", label: nav.staff },
        { href: "/admin/dashboard/analytics", label: nav.insights },
        { href: "/admin/dashboard/follow-up", label: nav.followUp },
      ]}
    >
      {children}
    </PortalShell>
  );
}
