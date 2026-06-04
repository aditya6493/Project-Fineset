"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { VisitFormFields } from "./types";
import type { VisitsColumnFilters } from "@/types";

const ALL_VALUE = "__all__";

export const VISIT_FILTER_COLUMN_IDS = new Set([
  "staffName",
  "customerType",
  "purchaseStatus",
  "visitType",
  "sourceChannel",
]);

type StaffOption = { id: string; name: string };

interface VisitColumnFilterHeaderProps {
  label: string;
  columnId: string;
  filters: VisitsColumnFilters;
  onFiltersChange: (next: VisitsColumnFilters) => void;
  staffOptions: StaffOption[];
  fieldLabels: VisitFormFields;
  filterAllLabel: string;
}

function isFilterActive(columnId: string, filters: VisitsColumnFilters): boolean {
  switch (columnId) {
    case "staffName":
      return Boolean(filters.staffId);
    case "customerType":
      return Boolean(filters.customerType);
    case "purchaseStatus":
      return Boolean(filters.purchaseStatus);
    case "visitType":
      return Boolean(filters.visitType);
    case "sourceChannel":
      return Boolean(filters.sourceChannel);
    default:
      return false;
  }
}

function getFilterValue(columnId: string, filters: VisitsColumnFilters): string {
  switch (columnId) {
    case "staffName":
      return filters.staffId ?? ALL_VALUE;
    case "customerType":
      return filters.customerType ?? ALL_VALUE;
    case "purchaseStatus":
      return filters.purchaseStatus ?? ALL_VALUE;
    case "visitType":
      return filters.visitType ?? ALL_VALUE;
    case "sourceChannel":
      return filters.sourceChannel ?? ALL_VALUE;
    default:
      return ALL_VALUE;
  }
}

function applyFilterChange(
  columnId: string,
  filters: VisitsColumnFilters,
  value: string,
): VisitsColumnFilters {
  const next = value === ALL_VALUE ? undefined : value;
  switch (columnId) {
    case "staffName":
      return { ...filters, staffId: next };
    case "customerType":
      return { ...filters, customerType: next };
    case "purchaseStatus":
      return { ...filters, purchaseStatus: next };
    case "visitType":
      return { ...filters, visitType: next };
    case "sourceChannel":
      return { ...filters, sourceChannel: next };
    default:
      return filters;
  }
}

function filterOptionsForColumn(
  columnId: string,
  staffOptions: StaffOption[],
  fieldLabels: VisitFormFields,
  filterAllLabel: string,
): Array<{ value: string; label: string }> {
  const all = [{ value: ALL_VALUE, label: filterAllLabel }];

  switch (columnId) {
    case "staffName":
      return [
        ...all,
        ...staffOptions.map((s) => ({ value: s.id, label: s.name })),
      ];
    case "customerType":
      return [
        ...all,
        ...Object.entries(fieldLabels.customerType.options).map(([value, label]) => ({
          value,
          label,
        })),
      ];
    case "purchaseStatus":
      return [
        ...all,
        ...Object.entries(fieldLabels.purchaseStatus.options).map(([value, label]) => ({
          value,
          label,
        })),
      ];
    case "visitType":
      return [
        ...all,
        ...Object.entries(fieldLabels.visitType.options).map(([value, label]) => ({
          value,
          label,
        })),
      ];
    case "sourceChannel":
      return [
        ...all,
        ...Object.entries(fieldLabels.sourceChannel.options).map(([value, label]) => ({
          value,
          label,
        })),
      ];
    default:
      return [];
  }
}

export function VisitColumnFilterHeader({
  label,
  columnId,
  filters,
  onFiltersChange,
  staffOptions,
  fieldLabels,
  filterAllLabel,
}: VisitColumnFilterHeaderProps) {
  if (!VISIT_FILTER_COLUMN_IDS.has(columnId)) {
    return <span>{label}</span>;
  }

  const active = isFilterActive(columnId, filters);
  const currentValue = getFilterValue(columnId, filters);
  const options = filterOptionsForColumn(
    columnId,
    staffOptions,
    fieldLabels,
    filterAllLabel,
  );

  return (
    <div className="flex items-center gap-1">
      <span className="font-medium text-text-secondary">{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors",
              "hover:bg-surface-secondary hover:text-text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40",
              active && "bg-brand-gold/15 text-brand-gold",
            )}
            aria-label={`Filter ${label}`}
            onClick={(event) => event.stopPropagation()}
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                currentValue === option.value && "bg-brand-gold/10 font-medium text-brand-gold",
              )}
              onSelect={() =>
                onFiltersChange(applyFilterChange(columnId, filters, option.value))
              }
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
