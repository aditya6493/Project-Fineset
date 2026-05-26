"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import {
  useRevealStaffCallPhone,
  useStaffCalls,
  useSubmitStaffCallOutcome,
} from "@/hooks/useStaffCalls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { CallFeedbackDialog } from "@/components/staff/CallFeedbackDialog";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/formatters";
import type { Content } from "@/content/en";
import type {
  GetStaffCallsParams,
  StaffCallListItem,
  StaffCallQueue,
  StaffCallSegment,
  StaffCallValueTier,
} from "@/types";

type StaffContent = Content["staff"];

interface StaffCallListProps {
  copy: StaffContent;
  emptyMessage: string;
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
  lastCallStatus: StaffCallListItem["lastCallStatus"],
): "ANSWERED" | "NOT_ANSWERED" | "NOT_CALLED" {
  if (lastCallStatus === "ANSWERED") return "ANSWERED";
  if (lastCallStatus === "NOT_ANSWERED") return "NOT_ANSWERED";
  return "NOT_CALLED";
}

export function StaffCallList({ copy, emptyMessage }: StaffCallListProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [segment, setSegment] = useState<StaffCallSegment>("ALL");
  const [valueTier, setValueTier] = useState<StaffCallValueTier>("ALL");
  const [queue, setQueue] = useState<StaffCallQueue>("ALL");
  const [page, setPage] = useState(1);
  const [activeItem, setActiveItem] = useState<StaffCallListItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const queryParams = useMemo<GetStaffCallsParams>(
    () => ({ year, month, segment, valueTier, queue, page, pageSize: 15 }),
    [year, month, segment, valueTier, queue, page],
  );

  const { data, isLoading, isError } = useStaffCalls(queryParams);
  const revealPhone = useRevealStaffCallPhone();
  const submitOutcome = useSubmitStaffCallOutcome();

  const segmentOptions = copy.calls.segments;
  const valueTierOptions = copy.calls.valueTiers;
  const queueOptions = copy.calls.queues;
  const yearOptions = useMemo(
    () => buildYearOptions(currentYear, data?.filters.availableYears ?? []),
    [currentYear, data?.filters.availableYears],
  );

  function getMonthCount(monthNumber: number): number {
    return data?.filters.months.find((item) => item.month === monthNumber)?.count ?? 0;
  }

  function handleYearChange(nextYear: number) {
    setYear(nextYear);
    if (nextYear === currentYear) {
      setMonth(currentMonth);
    } else {
      setMonth(1);
    }
    setPage(1);
  }

  function handleMonthChange(nextMonth: number) {
    setMonth(nextMonth);
    setPage(1);
  }

  function getFilterCount(
    group: "segments" | "valueTiers" | "queues",
    key: string,
  ): number {
    return data?.filters[group].find((item) => item.key === key)?.count ?? 0;
  }

  function handleFilterChange<T extends string>(
    setter: (value: T) => void,
    value: T,
  ) {
    setter(value);
    setPage(1);
  }

  async function handleOpenCall(item: StaffCallListItem) {
    setActiveItem(item);
    setDialogOpen(true);
    revealPhone.reset();
    await revealPhone.mutateAsync(item.visitId);
  }

  function handleCloseDialog(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setActiveItem(null);
      revealPhone.reset();
    }
  }

  function handleSubmitOutcome(payload: Parameters<typeof submitOutcome.mutate>[0]["payload"]) {
    if (!activeItem) return;

    submitOutcome.mutate(
      { visitId: activeItem.visitId, payload },
      {
        onSuccess: () => {
          handleCloseDialog(false);
        },
      },
    );
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="space-y-3">
        <Link
          href="/staff/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-brand-gold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {copy.calls.back}
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {copy.calls.title}
          </h1>
          <p className="text-text-secondary">{copy.calls.subtitle}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-card border border-border bg-surface-card p-4 shadow-card">
        <div className="space-y-2">
          <Label htmlFor="calls-year" className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {copy.calls.yearLabel}
          </Label>
          <Select
            value={String(year)}
            onValueChange={(value) => handleYearChange(Number(value))}
          >
            <SelectTrigger id="calls-year" className="max-w-xs">
              <SelectValue placeholder={copy.calls.yearLabel} />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((optionYear) => (
                <SelectItem key={optionYear} value={String(optionYear)}>
                  {optionYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {copy.calls.monthLabel}
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {copy.calls.monthLabels.map((label, index) => {
              const monthNumber = index + 1;
              return (
                <FilterChip
                  key={monthNumber}
                  active={month === monthNumber}
                  label={label}
                  count={getMonthCount(monthNumber)}
                  onClick={() => handleMonthChange(monthNumber)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {copy.calls.queueLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {queueOptions.map((option) => (
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
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {copy.calls.segmentLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {segmentOptions.map((option) => (
              <FilterChip
                key={option.key}
                active={segment === option.key}
                label={option.label}
                count={getFilterCount("segments", option.key)}
                onClick={() =>
                  handleFilterChange(setSegment, option.key as StaffCallSegment)
                }
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {copy.calls.valueTierLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {valueTierOptions.map((option) => (
              <FilterChip
                key={option.key}
                active={valueTier === option.key}
                label={option.label}
                count={getFilterCount("valueTiers", option.key)}
                onClick={() =>
                  handleFilterChange(setValueTier, option.key as StaffCallValueTier)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-card bg-surface-secondary"
            />
          ))}
        </div>
      ) : isError ? (
        <EmptyState message={copy.calls.loadError} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          message={
            segment === "ALL" && valueTier === "ALL" && queue === "ALL"
              ? copy.calls.noCustomersYet
              : emptyMessage
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((item) => {
              const callOutcomeKey = getCallOutcomeKey(item.lastCallStatus);

              return (
              <article
                key={item.visitId}
                className="rounded-card border border-border bg-surface-card p-4 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-semibold text-text-primary">
                        {item.displayName}
                      </h2>
                      <span
                        className={cn(
                          "rounded-chip px-2 py-0.5 text-xs font-medium",
                          badgeClass("value", item.valueTier),
                        )}
                      >
                        {copy.calls.valueTierLabels[item.valueTier]}
                      </span>
                    </div>

                    <p className="text-sm text-text-secondary">{item.visitSummary}</p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.queue !== "ALL" && (
                        <span
                          className={cn(
                            "rounded-chip px-2 py-0.5 font-medium",
                            badgeClass("queue", item.queue),
                          )}
                        >
                          {copy.calls.queueStatusLabels[item.queue]}
                        </span>
                      )}
                      <span
                        className={cn(
                          "rounded-chip px-2 py-0.5 font-medium",
                          badgeClass("callOutcome", callOutcomeKey),
                        )}
                      >
                        {copy.calls.callOutcomeLabels[callOutcomeKey]}
                      </span>
                      <span
                        className={cn(
                          "rounded-chip px-2 py-0.5 font-medium",
                          badgeClass("status", item.purchaseStatus),
                        )}
                      >
                        {copy.calls.purchaseStatusLabels[item.purchaseStatus]}
                      </span>
                      <span className="rounded-chip bg-surface-secondary px-2 py-0.5 text-text-secondary">
                        {copy.calls.customerTypeLabels[item.customerType]}
                      </span>
                      <span className="rounded-chip bg-surface-secondary px-2 py-0.5 text-text-muted">
                        {item.visitDateLabel}
                      </span>
                      {item.followUpDueDate && item.queue === "FOLLOW_UP" && (
                        <span className="rounded-chip bg-brand-gold/10 px-2 py-0.5 text-brand-gold">
                          {copy.calls.due} {formatDate(item.followUpDueDate)}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <div className="border-t border-border pt-2">
                        <p className="text-sm text-text-secondary">
                          <span className="font-medium text-text-primary">
                            {copy.calls.notesLabel}:{" "}
                          </span>
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-full"
                    disabled={!item.canCall}
                    aria-label={copy.calls.call}
                    onClick={() => void handleOpenCall(item)}
                  >
                    <Phone className="h-5 w-5" aria-hidden />
                  </Button>
                </div>
              </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                {copy.calls.previousPage}
              </Button>
              <p className="text-sm text-text-muted">
                {copy.calls.pageLabel
                  .replace("{page}", String(page))
                  .replace("{total}", String(totalPages))}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                {copy.calls.nextPage}
              </Button>
            </div>
          )}
        </>
      )}

      <CallFeedbackDialog
        copy={copy.calls}
        item={activeItem}
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        dialInfo={revealPhone.data ?? null}
        isDialLoading={revealPhone.isPending}
        isSubmitting={submitOutcome.isPending}
        onSubmit={handleSubmitOutcome}
      />
    </div>
  );
}
