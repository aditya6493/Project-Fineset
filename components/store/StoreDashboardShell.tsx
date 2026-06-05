"use client";

import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/PortalShell";

interface StoreDashboardShellProps {
  title: string;
  signOutLabel: string;
  children: ReactNode;
}

export function StoreDashboardShell({
  title,
  signOutLabel,
  children,
}: StoreDashboardShellProps) {
  return (
    <PortalShell title={title} signOutLabel={signOutLabel}>
      {children}
    </PortalShell>
  );
}
