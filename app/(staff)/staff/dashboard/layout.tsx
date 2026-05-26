import { content } from "@/content/en";
import { PortalShell } from "@/components/layout/PortalShell";

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
