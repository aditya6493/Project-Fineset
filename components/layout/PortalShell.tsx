"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

interface PortalShellProps {
  title: string;
  navItems: NavItem[];
  signOutLabel: string;
  children: React.ReactNode;
}

export function PortalShell({
  title,
  navItems,
  signOutLabel,
  children,
}: PortalShellProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/store/dashboard" || href === "/admin/dashboard" || href === "/staff/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      <header className="sticky top-0 z-10 border-b border-border bg-surface-card shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-page-x py-4 sm:px-page-md">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-display text-lg font-semibold text-brand-gold">
              {title}
            </Link>
            <nav className="hidden gap-4 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm transition-colors",
                    isActive(item.href)
                      ? "font-medium text-brand-gold"
                      : "text-text-secondary hover:text-brand-gold",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            {signOutLabel}
          </Button>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-border px-page-x py-2 sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-chip px-3 py-1 text-xs",
                isActive(item.href)
                  ? "bg-brand-gold text-white"
                  : "bg-surface-secondary text-text-secondary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-page-x py-6 sm:px-page-md">{children}</main>
    </div>
  );
}
