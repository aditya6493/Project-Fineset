"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChipMultiSelectProps {
  label: string;
  options: Record<string, string>;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  exclusiveKeys?: string[];
}

export function ChipMultiSelect({
  label,
  options,
  value,
  onChange,
  error,
  exclusiveKeys = [],
}: ChipMultiSelectProps) {
  function toggle(option: string) {
    const isExclusive = exclusiveKeys.includes(option);

    if (isExclusive) {
      onChange(value.includes(option) ? [] : [option]);
      return;
    }

    const withoutExclusive = value.filter((item) => !exclusiveKeys.includes(item));

    if (withoutExclusive.includes(option)) {
      onChange(withoutExclusive.filter((item) => item !== option));
      return;
    }

    onChange([...withoutExclusive, option]);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(options).map(([key, optionLabel]) => {
          const selected = value.includes(key);
          return (
            <Button
              key={key}
              type="button"
              variant={selected ? "default" : "outline"}
              size="sm"
              className={cn("rounded-chip", selected && "bg-brand-gold")}
              onClick={() => toggle(key)}
            >
              {optionLabel}
            </Button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-status-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
