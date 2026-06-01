"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { FilterOption } from "@/types/admin-business-analytics";

interface AnalyticsToggledFilterProps {
  id: string;
  label: string;
  enabled: boolean;
  value: string;
  options: FilterOption[];
  placeholder: string;
  onEnabledChange: (enabled: boolean) => void;
  onValueChange: (value: string) => void;
}

export function AnalyticsToggledFilter({
  id,
  label,
  enabled,
  value,
  options,
  placeholder,
  onEnabledChange,
  onValueChange,
}: AnalyticsToggledFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Label htmlFor={id} className={enabled ? "" : "text-text-muted"}>
          {label}
        </Label>
        <Select
          value={value || undefined}
          onValueChange={onValueChange}
          disabled={!enabled}
        >
          <SelectTrigger id={id} className={!enabled ? "opacity-60" : ""}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Switch
        id={`${id}-toggle`}
        checked={enabled}
        onCheckedChange={onEnabledChange}
        className="shrink-0"
        aria-label={`Use ${label} filter`}
      />
    </div>
  );
}
