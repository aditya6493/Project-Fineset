"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterOption } from "@/types/admin-business-analytics";

interface AnalyticsFilterSelectProps {
  id: string;
  label: string;
  value: string;
  allLabel: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export function AnalyticsFilterSelect({
  id,
  label,
  value,
  allLabel,
  options,
  onChange,
}: AnalyticsFilterSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
