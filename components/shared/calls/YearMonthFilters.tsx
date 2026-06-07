import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FilterChip } from "./FilterChip";

interface YearMonthFiltersProps {
  year: number;
  month: number;
  yearLabel: string;
  monthLabels: readonly string[];
  yearOptions: number[];
  yearSelectId?: string;
  monthGroupLabel?: string;
  scrollMonths?: boolean;
  variant?: "default" | "compact";
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
  scrollMonths = false,
  variant = "default",
  getMonthCount,
  onYearChange,
  onMonthChange,
}: YearMonthFiltersProps) {
  if (variant === "compact") {
    return (
      <div className="min-w-0 space-y-2 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
        <Select value={String(year)} onValueChange={(value) => onYearChange(Number(value))}>
          <SelectTrigger className="h-8 w-24 shrink-0 rounded-full border-border text-sm">
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

        <div className="min-w-0 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] sm:flex-1 [&::-webkit-scrollbar]:hidden">
          {monthLabels.map((label, index) => {
            const monthNumber = index + 1;
            const count = getMonthCount(monthNumber);
            const isActive = month === monthNumber;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onMonthChange(monthNumber)}
                aria-pressed={isActive}
                className={cn(
                  "flex h-8 shrink-0 flex-col items-center justify-center rounded-full px-3 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-brand-gold text-white"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80 hover:text-text-primary",
                )}
              >
                {label}
                {count > 0 && !isActive && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-brand-gold/60" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

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
      <div
        className="space-y-1"
        role="group"
        aria-labelledby={monthGroupLabel ? "month-filter-label" : undefined}
      >
        {monthGroupLabel && (
          <p
            id="month-filter-label"
            className="text-xs font-medium uppercase tracking-wide text-text-muted"
          >
            {monthGroupLabel}
          </p>
        )}
        <div
          className={
            scrollMonths
              ? "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : "flex flex-wrap gap-2"
          }
        >
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
