"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFieldSalesList } from "@/hooks/useFieldSalesList";
import { getStaff, getStaffPerformance } from "@/lib/api/staff";
import { getStores } from "@/lib/api/stores";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { Content } from "@/content/en";
import type { GetFieldSalesListParams } from "@/types";

type PortalFieldSalesCopy = Content["portal"]["fieldSales"];
type CommonContent = Content["common"];

interface PortalFieldSalesLogProps {
  copy: PortalFieldSalesCopy;
  common: CommonContent;
  emptyMessage: string;
  allStoresLabel: string;
  allStaffLabel: string;
  showStoreFilter?: boolean;
  initialStoreId?: string;
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className="gap-1.5"
    >
      {label}
      <span
        className={cn(
          "rounded-chip px-1.5 py-0.5 text-[10px]",
          active ? "bg-white/20 text-white" : "bg-surface-secondary text-text-muted",
        )}
      >
        {count}
      </span>
    </Button>
  );
}

const YEAR_LOOKBACK = 10;

function buildYearOptions(currentYear: number, fromData: number[]): number[] {
  const years = new Set<number>();
  for (let offset = 0; offset < YEAR_LOOKBACK; offset += 1) {
    years.add(currentYear - offset);
  }
  for (const year of fromData) {
    years.add(year);
  }
  return Array.from(years).sort((a, b) => b - a);
}

function formatLabel(value: string): string {
  return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function PortalFieldSalesLog({
  copy,
  common,
  emptyMessage,
  allStoresLabel,
  allStaffLabel,
  showStoreFilter = false,
  initialStoreId,
}: PortalFieldSalesLogProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState(initialStoreId ?? "all");
  const [staffFilter, setStaffFilter] = useState("all");

  const queryParams = useMemo<GetFieldSalesListParams>(
    () => ({
      year,
      month,
      page,
      pageSize: 15,
      search: search || undefined,
      storeId: showStoreFilter && storeFilter !== "all" ? storeFilter : undefined,
      staffId: staffFilter !== "all" ? staffFilter : undefined,
    }),
    [year, month, page, search, showStoreFilter, storeFilter, staffFilter],
  );

  const { data, isLoading, isError } = useFieldSalesList(queryParams);

  const { data: stores } = useQuery({
    queryKey: ["stores", "filter"],
    queryFn: () => getStores({ page: 1, pageSize: 100 }),
    enabled: showStoreFilter,
    ...LIVE_QUERY_OPTIONS,
  });

  const { data: storeStaff } = useQuery({
    queryKey: ["staff", "list", showStoreFilter ? storeFilter : "store"],
    queryFn: () => getStaff(),
    enabled: !showStoreFilter,
    ...LIVE_QUERY_OPTIONS,
  });

  const { data: adminStaff } = useQuery({
    queryKey: ["staff", "performance", storeFilter],
    queryFn: () =>
      getStaffPerformance(storeFilter === "all" ? undefined : storeFilter),
    enabled: showStoreFilter,
    ...LIVE_QUERY_OPTIONS,
  });

  const staffOptions = showStoreFilter
    ? (adminStaff ?? []).map((member) => ({
        id: member.staffId,
        name: member.staffName,
      }))
    : (storeStaff ?? []).map((member) => ({
        id: member.id,
        name: member.name,
      }));

  const yearOptions = useMemo(
    () => buildYearOptions(currentYear, data?.filters.availableYears ?? []),
    [currentYear, data?.filters.availableYears],
  );

  function getMonthCount(monthNumber: number): number {
    return data?.filters.months.find((item) => item.month === monthNumber)?.count ?? 0;
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">{copy.title}</h1>
          <p className="mt-1 text-sm text-text-muted">{copy.subtitle}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {showStoreFilter && (
            <div className="space-y-1">
              <Label>{copy.storeFilterLabel}</Label>
              <Select
                value={storeFilter}
                onValueChange={(value) => {
                  setStoreFilter(value);
                  setStaffFilter("all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder={common.filter} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{allStoresLabel}</SelectItem>
                  {stores?.data.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>{copy.staffFilterLabel}</Label>
            <Select
              value={staffFilter}
              onValueChange={(value) => {
                setStaffFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder={common.filter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{allStaffLabel}</SelectItem>
                {staffOptions.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="field-sales-search">{copy.searchLabel}</Label>
        <Input
          id="field-sales-search"
          value={search}
          placeholder={copy.searchPlaceholder}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label>{copy.yearLabel}</Label>
          <Select
            value={String(year)}
            onValueChange={(value) => {
              const nextYear = Number(value);
              setYear(nextYear);
              setMonth(nextYear === currentYear ? currentMonth : 1);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-28">
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
        <div className="flex flex-wrap gap-2">
          {copy.monthLabels.map((label, index) => {
            const monthNumber = index + 1;
            const count = getMonthCount(monthNumber);
            return (
              <FilterChip
                key={label}
                active={month === monthNumber}
                label={label}
                count={count}
                onClick={() => {
                  setMonth(monthNumber);
                  setPage(1);
                }}
              />
            );
          })}
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-text-muted">{common.loading}</p>
      )}

      {isError && (
        <p className="text-sm text-status-error">{copy.loadError}</p>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState message={emptyMessage} />
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="space-y-3">
          {data.data.map((item) => (
            <article
              key={item.id}
              className="rounded-card border border-border bg-surface-card p-4 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-text-primary">{item.customerName}</p>
                  <p className="text-sm text-text-muted">{item.customerPhone}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {copy.columns.staff}: {item.staffName}
                    {showStoreFilter ? ` · ${item.storeName}` : ""}
                  </p>
                </div>
                <div className="text-right text-xs text-text-muted">
                  <p>{item.activityDateLabel}</p>
                  {item.locationLabel && <p>{item.locationLabel}</p>}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-chip bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
                  {formatLabel(item.activityType)}
                </span>
                <span className="rounded-chip bg-brand-gold/10 px-2 py-0.5 text-xs font-medium text-brand-gold">
                  {formatLabel(item.enrollmentOutcome)}
                </span>
                {item.monthlyCommitment != null && (
                  <span className="rounded-chip bg-status-success/10 px-2 py-0.5 text-xs font-medium text-status-success">
                    {formatCurrency(item.monthlyCommitment)}/mo
                  </span>
                )}
                {item.followUpNeeded && item.followUpDate && (
                  <span className="rounded-chip bg-status-warning/10 px-2 py-0.5 text-xs font-medium text-status-warning">
                    {copy.followUpDue}: {formatDate(item.followUpDate)}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-text-secondary">
                {copy.columns.schemes}: {item.schemesPitched.map(formatLabel).join(", ")}
              </p>

              {item.reasonNoEnrollment && (
                <p className="mt-1 text-sm text-text-muted">
                  {copy.columns.reason}: {formatLabel(item.reasonNoEnrollment)}
                </p>
              )}

              {item.staffNotes && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-medium text-text-muted">{copy.notesLabel}</p>
                  <p className="mt-1 text-sm text-text-secondary">{item.staffNotes}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            {copy.previousPage}
          </Button>
          <p className="text-sm text-text-muted">
            {copy.pageLabel
              .replace("{page}", String(page))
              .replace("{total}", String(totalPages))}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            {copy.nextPage}
          </Button>
        </div>
      )}
    </div>
  );
}
