"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function DashboardCollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: DashboardCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = useId();
  const triggerId = `${sectionId}-trigger`;
  const panelId = `${sectionId}-panel`;

  return (
    <section className="rounded-card border border-border bg-surface-card">
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-text-primary sm:px-6",
          "transition-colors hover:bg-surface-secondary/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card",
          open && "border-b border-border",
        )}
      >
        <span className="min-w-0 flex-1">
          <span
            role="heading"
            aria-level={2}
            className="font-display text-lg font-semibold text-text-primary"
          >
            {title}
          </span>
          {subtitle ? (
            <p className="mt-1.5 text-sm font-sans leading-relaxed text-text-muted">
              {subtitle}
            </p>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 size-5 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="min-w-0 overflow-x-hidden p-4 sm:p-6"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
