import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterChip } from "./FilterChip";

interface YearMonthFiltersProps {
  year: number;
  month: number;
  yearLabel: string;
  monthLabels: readonly string[];
  yearOptions: number[];
  yearSelectId?: string;
  monthGroupLabel?: string;
  getMonthCount: (monthNumber: number) => number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export function YearMonthFilters({
  year,
  month,
  yearLabel,
  monthLabels,
  yearOptions,
  yearSelectId = "calls-year",
  monthGroupLabel,
  getMonthCount,
  onYearChange,
  onMonthChange,
}: YearMonthFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor={yearSelectId}>{yearLabel}</Label>
        <Select
          value={String(year)}
          onValueChange={(value) => onYearChange(Number(value))}
        >
          <SelectTrigger id={yearSelectId} className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1" role="group" aria-labelledby={monthGroupLabel ? "month-filter-label" : undefined}>
        {monthGroupLabel && (
          <p id="month-filter-label" className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {monthGroupLabel}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {monthLabels.map((label, index) => {
            const monthNumber = index + 1;
            return (
              <FilterChip
                key={label}
                active={month === monthNumber}
                label={label}
                count={getMonthCount(monthNumber)}
                onClick={() => onMonthChange(monthNumber)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
