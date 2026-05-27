"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearVisitDraft } from "@/components/forms/VisitForm/useVisitDraft";
import { Logo } from "@/components/shared/Logo";

interface NavItem {
  href: string;
  label: string;
}

interface PortalShellProps {
  title: string;
  navItems?: NavItem[];
  signOutLabel: string;
  children: React.ReactNode;
}

export function PortalShell({
  title,
  navItems = [],
  signOutLabel,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      clearVisitDraft();
      queryClient.clear();
      await fetch("/api/auth/signout", { method: "POST" });
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  }

  function isActive(href: string): boolean {
    if (href === "/staff/dashboard") {
      return pathname === href;
    }
    if (href === "/store/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-input focus:bg-brand-gold focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-10 border-b border-border bg-surface-card shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-page-x py-4 sm:px-page-md">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={28} linked={false} />
              <span className="font-display text-lg font-semibold text-brand-gold">
                {title}
              </span>
            </Link>
            {navItems.length > 0 && (
              <nav className="hidden gap-4 sm:flex" aria-label="Main navigation">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
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
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
          >
            {isSigningOut ? "Signing out…" : signOutLabel}
          </Button>
        </div>
        {navItems.length > 0 && (
          <nav
            className="flex h-14 items-center gap-2 overflow-x-auto border-t border-border px-page-x sm:hidden"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-chip px-3 py-2 text-xs",
                  isActive(item.href)
                    ? "bg-brand-gold text-white"
                    : "bg-surface-secondary text-text-secondary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main id="main-content" className="mx-auto max-w-7xl px-page-x py-6 sm:px-page-md">
        {children}
      </main>
    </div>
  );
}
