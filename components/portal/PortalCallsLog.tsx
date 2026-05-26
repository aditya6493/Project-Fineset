"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePortalCalls } from "@/hooks/usePortalCalls";
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
import { formatDate } from "@/lib/utils/formatters";
import type { Content } from "@/content/en";
import type {
  GetPortalCallsParams,
  PortalCallListItem,
  StaffCallQueue,
  StaffCallSegment,
  StaffCallValueTier,
} from "@/types";

type PortalCallsCopy = Content["portal"]["calls"];
type CommonContent = Content["common"];

interface PortalCallsLogProps {
  copy: PortalCallsCopy;
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

function badgeClass(
  kind: "segment" | "value" | "status" | "queue" | "callOutcome",
  value: string,
): string {
  if (kind === "value") {
    if (value === "HIGH") return "bg-brand-gold/10 text-brand-gold";
    if (value === "MID") return "bg-status-warning/10 text-status-warning";
    return "bg-surface-secondary text-text-secondary";
  }

  if (kind === "queue") {
    if (value === "FOLLOW_UP") return "bg-brand-gold/10 text-brand-gold";
    return "bg-surface-secondary text-text-secondary";
  }

  if (kind === "callOutcome") {
    if (value === "ANSWERED") return "bg-status-success/10 text-status-success";
    if (value === "NOT_ANSWERED") return "bg-status-error/10 text-status-error";
    return "bg-surface-secondary text-text-muted";
  }

  if (value === "PURCHASED") return "bg-status-success/10 text-status-success";
  if (value === "NOT_PURCHASED") return "bg-status-error/10 text-status-error";
  return "bg-surface-secondary text-text-secondary";
}

function getCallOutcomeKey(
  lastCallStatus: PortalCallListItem["lastCallStatus"],
): "ANSWERED" | "NOT_ANSWERED" | "NOT_CALLED" {
  if (lastCallStatus === "ANSWERED") return "ANSWERED";
  if (lastCallStatus === "NOT_ANSWERED") return "NOT_ANSWERED";
  return "NOT_CALLED";
}

export function PortalCallsLog({
  copy,
  common,
  emptyMessage,
  allStoresLabel,
  allStaffLabel,
  showStoreFilter = false,
  initialStoreId,
}: PortalCallsLogProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [segment, setSegment] = useState<StaffCallSegment>("ALL");
  const [valueTier, setValueTier] = useState<StaffCallValueTier>("ALL");
  const [queue, setQueue] = useState<StaffCallQueue>("ALL");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState(initialStoreId ?? "all");
  const [staffFilter, setStaffFilter] = useState("all");

  const queryParams = useMemo<GetPortalCallsParams>(
    () => ({
      year,
      month,
      segment,
      valueTier,
      queue,
      page,
      pageSize: 15,
      search: search || undefined,
      storeId: showStoreFilter && storeFilter !== "all" ? storeFilter : undefined,
      staffId: staffFilter !== "all" ? staffFilter : undefined,
    }),
    [
      year,
      month,
      segment,
      valueTier,
      queue,
      page,
      search,
      showStoreFilter,
      storeFilter,
      staffFilter,
    ],
  );

  const { data, isLoading, isError } = usePortalCalls(queryParams);

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

  function getFilterCount(
    group: "segments" | "valueTiers" | "queues",
    key: string,
  ): number {
    return data?.filters[group].find((item) => item.key === key)?.count ?? 0;
  }

  function handleFilterChange<T extends string>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
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
        <Label htmlFor="calls-search">{copy.searchLabel}</Label>
        <Input
          id="calls-search"
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

      <div className="space-y-2">
        <Label>{copy.queueLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {copy.queues.map((option) => (
            <FilterChip
              key={option.key}
              active={queue === option.key}
              label={option.label}
              count={getFilterCount("queues", option.key)}
              onClick={() => handleFilterChange(setQueue, option.key as StaffCallQueue)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{copy.segmentLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {copy.segments.map((option) => (
            <FilterChip
              key={option.key}
              active={segment === option.key}
              label={option.label}
              count={getFilterCount("segments", option.key)}
              onClick={() => handleFilterChange(setSegment, option.key as StaffCallSegment)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{copy.valueTierLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {copy.valueTiers.map((option) => (
            <FilterChip
              key={option.key}
              active={valueTier === option.key}
              label={option.label}
              count={getFilterCount("valueTiers", option.key)}
              onClick={() => handleFilterChange(setValueTier, option.key as StaffCallValueTier)}
            />
          ))}
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
          {data.data.map((item) => {
            const callOutcomeKey = getCallOutcomeKey(item.lastCallStatus);
            return (
              <article
                key={item.visitId}
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
                    <p>{item.visitDateLabel}</p>
                    {item.followUpDueDate && (
                      <p>
                        {copy.due}: {formatDate(item.followUpDueDate)}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-sm text-text-secondary">{item.visitSummary}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-chip px-2 py-0.5 text-xs font-medium",
                      badgeClass("queue", item.queue),
                    )}
                  >
                    {copy.queueStatusLabels[item.queue]}
                  </span>
                  <span
                    className={cn(
                      "rounded-chip px-2 py-0.5 text-xs font-medium",
                      badgeClass("callOutcome", callOutcomeKey),
                    )}
                  >
                    {copy.callOutcomeLabels[callOutcomeKey]}
                  </span>
                  <span
                    className={cn(
                      "rounded-chip px-2 py-0.5 text-xs font-medium",
                      badgeClass("status", item.purchaseStatus),
                    )}
                  >
                    {copy.purchaseStatusLabels[item.purchaseStatus]}
                  </span>
                  <span
                    className={cn(
                      "rounded-chip px-2 py-0.5 text-xs font-medium",
                      badgeClass("segment", item.customerType),
                    )}
                  >
                    {copy.customerTypeLabels[item.customerType]}
                  </span>
                  <span
                    className={cn(
                      "rounded-chip px-2 py-0.5 text-xs font-medium",
                      badgeClass("value", item.valueTier),
                    )}
                  >
                    {copy.valueTierLabels[item.valueTier]}
                  </span>
                </div>

                {item.notes && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-xs font-medium text-text-muted">{copy.notesLabel}</p>
                    <p className="mt-1 text-sm text-text-secondary">{item.notes}</p>
                  </div>
                )}
              </article>
            );
          })}
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
