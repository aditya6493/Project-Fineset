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
        { href: "/store/dashboard/follow-up", label: nav.followUp },
        { href: "/store/dashboard/staff", label: nav.staff },
        { href: "/store/dashboard/analytics", label: nav.analytics },
      ]}
    >
      {children}
    </PortalShell>
  );
}
