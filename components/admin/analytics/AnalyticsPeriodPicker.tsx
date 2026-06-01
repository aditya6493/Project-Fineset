"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarRange, ChevronDown, GitCompareArrows } from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  AnalyticsDayCalendar,
  AnalyticsRangeCalendar,
} from "@/components/admin/analytics/AnalyticsShadcnCalendars";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatMonthYearLabel } from "@/lib/utils/analytics-date-range";
import type { AnalyticsPeriodSelection } from "@/lib/query/admin-business-analytics-period";
import type { AdminBusinessAnalyticsQuery } from "@/lib/validations/admin-business-analytics.schema";

type CustomMode = "month" | "range" | "day" | "compare";

interface AnalyticsPeriodPickerCopy {
  dateRangeLabel: string;
  tabPresets: string;
  tabRange: string;
  tabDay: string;
  tabMonth: string;
  tabCompare: string;
  periodALabel: string;
  periodBLabel: string;
  applyLabel: string;
  confirmLabel: string;
  rangeSelectionHint: string;
  daySelectionHint: string;
  customSectionLabel: string;
}

interface AnalyticsPeriodPickerProps {
  copy: AnalyticsPeriodPickerCopy;
  selection: AnalyticsPeriodSelection;
  onSelectionChange: (selection: AnalyticsPeriodSelection) => void;
  presets: Array<{
    value: NonNullable<AdminBusinessAnalyticsQuery["period"]>;
    label: string;
  }>;
}

const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
] as const;

function buildYearOptions(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let year = current + 1; year >= current - 8; year -= 1) {
    years.push(year);
  }
  return years;
}

function presetLabel(period: NonNullable<AdminBusinessAnalyticsQuery["period"]>): string {
  switch (period) {
    case "today":
      return "Today";
    case "week":
      return "7 days";
    case "month":
      return "30 days";
    case "last3months":
      return "90 days";
    case "last6months":
      return "6 months";
  }
}

function selectionHeadline(selection: AnalyticsPeriodSelection): string {
  switch (selection.mode) {
    case "preset":
      return presetLabel(selection.period);
    case "range":
      return `${format(selection.startDate, "d MMM yyyy")} – ${format(selection.endDate, "d MMM yyyy")}`;
    case "day":
      return format(selection.date, "d MMM yyyy");
    case "month":
      return formatMonthYearLabel(selection.month, selection.year);
    case "compare":
      return `${formatMonthYearLabel(selection.periodA.month, selection.periodA.year)} vs ${formatMonthYearLabel(selection.periodB.month, selection.periodB.year)}`;
  }
}

function selectionModeHint(selection: AnalyticsPeriodSelection): string {
  switch (selection.mode) {
    case "preset":
      return "Quick range";
    case "range":
      return "Custom range";
    case "day":
      return "Single day";
    case "month":
      return "Calendar month";
    case "compare":
      return "Month comparison";
  }
}

function MonthYearPicker({
  month,
  year,
  years,
  onChange,
  className,
}: {
  month: number;
  year: number;
  years: number[];
  onChange: (next: { month: number; year: number }) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1.5", className)}>
      <Select
        value={String(month)}
        onValueChange={(value) => onChange({ month: Number(value), year })}
      >
        <SelectTrigger className="h-9 flex-1 bg-surface-card text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((item) => (
            <SelectItem key={item.value} value={String(item.value)}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(year)}
        onValueChange={(value) => onChange({ month, year: Number(value) })}
      >
        <SelectTrigger className="h-9 w-[5.25rem] bg-surface-card text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((item) => (
            <SelectItem key={item} value={String(item)}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const CUSTOM_MODES: Array<{ id: CustomMode; label: string }> = [
  { id: "month", label: "Month" },
  { id: "range", label: "Range" },
  { id: "day", label: "Day" },
  { id: "compare", label: "Compare" },
];

export function AnalyticsPeriodPicker({
  copy,
  selection,
  onSelectionChange,
  presets,
}: AnalyticsPeriodPickerProps) {
  const years = useMemo(() => buildYearOptions(), []);
  const [open, setOpen] = useState(false);

  const initialCustomMode: CustomMode =
    selection.mode === "preset" ? "month" : selection.mode;

  const [customMode, setCustomMode] = useState<CustomMode>(initialCustomMode);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(
    selection.mode === "range"
      ? { from: selection.startDate, to: selection.endDate }
      : undefined,
  );
  const [draftDay, setDraftDay] = useState<Date | undefined>(
    selection.mode === "day" ? selection.date : undefined,
  );
  const [draftMonth, setDraftMonth] = useState(
    selection.mode === "month"
      ? { month: selection.month, year: selection.year }
      : { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  );
  const [draftCompare, setDraftCompare] = useState(
    selection.mode === "compare"
      ? { periodA: selection.periodA, periodB: selection.periodB }
      : { periodA: { month: 5, year: 2026 }, periodB: { month: 5, year: 2025 } },
  );

  useEffect(() => {
    if (!open) return;
    if (selection.mode !== "preset") {
      setCustomMode(selection.mode);
    }
    if (selection.mode === "range") {
      setDraftRange({ from: selection.startDate, to: selection.endDate });
    }
    if (selection.mode === "day") setDraftDay(selection.date);
    if (selection.mode === "month") {
      setDraftMonth({ month: selection.month, year: selection.year });
    }
    if (selection.mode === "compare") {
      setDraftCompare({
        periodA: selection.periodA,
        periodB: selection.periodB,
      });
    }
  }, [open, selection]);

  function applyPreset(period: NonNullable<AdminBusinessAnalyticsQuery["period"]>) {
    onSelectionChange({ mode: "preset", period });
    setOpen(false);
  }

  function applyMonth(next: { month: number; year: number }) {
    setDraftMonth(next);
    onSelectionChange({ mode: "month", month: next.month, year: next.year });
    setOpen(false);
  }

  function applyCompare() {
    onSelectionChange({
      mode: "compare",
      periodA: draftCompare.periodA,
      periodB: draftCompare.periodB,
    });
    setOpen(false);
  }

  function confirmRange() {
    if (!draftRange?.from || !draftRange?.to) return;
    onSelectionChange({
      mode: "range",
      startDate: draftRange.from,
      endDate: draftRange.to,
    });
    setOpen(false);
  }

  function confirmDay() {
    if (!draftDay) return;
    onSelectionChange({ mode: "day", date: draftDay });
    setOpen(false);
  }

  const rangeDraftLabel =
    draftRange?.from && draftRange?.to
      ? `${format(draftRange.from, "d MMM yyyy")} – ${format(draftRange.to, "d MMM yyyy")}`
      : draftRange?.from
        ? `${format(draftRange.from, "d MMM yyyy")} – …`
        : copy.rangeSelectionHint;

  const dayDraftLabel = draftDay
    ? format(draftDay, "d MMM yyyy")
    : copy.daySelectionHint;

  const activePreset =
    selection.mode === "preset" ? selection.period : null;

  const showsCalendar = customMode === "range" || customMode === "day";

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {copy.dateRangeLabel}
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-input border border-border bg-surface-card px-3 py-2.5 text-left transition-colors",
              "hover:border-brand-gold/40 hover:bg-surface-secondary/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold",
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
              {selection.mode === "compare" ? (
                <GitCompareArrows className="h-4 w-4" />
              ) : (
                <CalendarRange className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-text-primary">
                {selectionHeadline(selection)}
              </span>
              <span className="block truncate text-xs text-text-muted">
                {selectionModeHint(selection)}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-text-muted transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            "p-0",
            showsCalendar
              ? "w-[min(calc(100vw-1rem),20.5rem)]"
              : "w-[min(calc(100vw-2rem),20rem)]",
          )}
          align="start"
          sideOffset={6}
        >
          <div className="border-b border-border p-3">
            <p className="mb-2 text-xs font-medium text-text-secondary">{copy.tabPresets}</p>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => applyPreset(preset.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    activePreset === preset.value
                      ? "bg-brand-gold text-white"
                      : "bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80 hover:text-text-primary",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            <p className="mb-2 text-xs font-medium text-text-secondary">
              {copy.customSectionLabel}
            </p>
            <div className="mb-3 flex gap-1 rounded-input bg-surface-secondary p-1">
              {CUSTOM_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setCustomMode(mode.id)}
                  className={cn(
                    "flex-1 rounded-[6px] py-1.5 text-xs font-medium transition-colors",
                    customMode === mode.id
                      ? "bg-surface-card text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary",
                  )}
                >
                  {mode.id === "month"
                    ? copy.tabMonth
                    : mode.id === "range"
                      ? copy.tabRange
                      : mode.id === "day"
                        ? copy.tabDay
                        : copy.tabCompare}
                </button>
              ))}
            </div>

            {customMode === "month" && (
              <MonthYearPicker
                month={draftMonth.month}
                year={draftMonth.year}
                years={years}
                onChange={applyMonth}
              />
            )}

            {customMode === "range" && (
              <div className="space-y-3">
                <AnalyticsRangeCalendar
                  selected={draftRange}
                  onSelect={setDraftRange}
                />
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-center text-xs text-text-muted">
                    {rangeDraftLabel}
                  </p>
                  <Button
                    type="button"
                    className="w-full"
                    size="sm"
                    disabled={!draftRange?.from || !draftRange?.to}
                    onClick={confirmRange}
                  >
                    {copy.confirmLabel}
                  </Button>
                </div>
              </div>
            )}

            {customMode === "day" && (
              <div className="space-y-3">
                <AnalyticsDayCalendar selected={draftDay} onSelect={setDraftDay} />
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-center text-xs text-text-muted">{dayDraftLabel}</p>
                  <Button
                    type="button"
                    className="w-full"
                    size="sm"
                    disabled={!draftDay}
                    onClick={confirmDay}
                  >
                    {copy.confirmLabel}
                  </Button>
                </div>
              </div>
            )}

            {customMode === "compare" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                    {copy.periodALabel}
                  </p>
                  <MonthYearPicker
                    month={draftCompare.periodA.month}
                    year={draftCompare.periodA.year}
                    years={years}
                    onChange={(periodA) =>
                      setDraftCompare((current) => ({ ...current, periodA }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-text-muted">vs</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                    {copy.periodBLabel}
                  </p>
                  <MonthYearPicker
                    month={draftCompare.periodB.month}
                    year={draftCompare.periodB.year}
                    years={years}
                    onChange={(periodB) =>
                      setDraftCompare((current) => ({ ...current, periodB }))
                    }
                  />
                </div>
                <Button type="button" className="w-full" size="sm" onClick={applyCompare}>
                  {copy.applyLabel}
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
