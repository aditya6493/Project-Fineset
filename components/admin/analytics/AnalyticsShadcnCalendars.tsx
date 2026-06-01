"use client";

import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const CALENDAR_YEARS = {
  fromYear: 2018,
  toYear: new Date().getFullYear() + 1,
} as const;

interface AnalyticsRangeCalendarProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  className?: string;
}

export function AnalyticsRangeCalendar({
  selected,
  onSelect,
  className,
}: AnalyticsRangeCalendarProps) {
  return (
    <Calendar
      mode="range"
      captionLayout="dropdown"
      defaultMonth={selected?.from}
      selected={selected}
      onSelect={onSelect}
      numberOfMonths={1}
      {...CALENDAR_YEARS}
      className={cn("rounded-lg border", className)}
    />
  );
}

interface AnalyticsDayCalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

export function AnalyticsDayCalendar({
  selected,
  onSelect,
  className,
}: AnalyticsDayCalendarProps) {
  return (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      defaultMonth={selected}
      selected={selected}
      onSelect={onSelect}
      {...CALENDAR_YEARS}
      className={cn("rounded-lg border", className)}
    />
  );
}
