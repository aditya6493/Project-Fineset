"use client";

import { cn } from "@/lib/utils";

interface FilterOption {
  key: string;
  label: string;
}

interface ScrollableFilterRowProps {
  label: string;
  ariaLabel?: string;
  options: readonly FilterOption[];
  value: string;
  onChange: (key: string) => void;
  getCount?: (key: string) => number;
}

export function ScrollableFilterRow({
  label,
  ariaLabel,
  options,
  value,
  onChange,
  getCount,
}: ScrollableFilterRowProps) {
  return (
    <div className="min-w-0 space-y-1.5" role="group" aria-label={ariaLabel ?? label}>
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const count = getCount?.(option.key) ?? 0;
          const isActive = value === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              aria-pressed={isActive}
              className={cn(
                "flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-medium transition-colors",
                isActive
                  ? "bg-brand-gold text-white"
                  : "bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
              )}
            >
              {option.label}
              {count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-surface-secondary text-text-muted",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
