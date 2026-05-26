"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  useRevealStaffCallPhone,
  useStaffCalls,
  useSubmitStaffCallOutcome,
} from "@/hooks/useStaffCalls";
import { toast } from "@/hooks/useToast";
import { EmptyState } from "@/components/shared/EmptyState";
import { QueryLoadState } from "@/components/shared/QueryLoadState";
import {
  CallQueueFilters,
  LogPagination,
  StaffCallCard,
  YearMonthFilters,
  buildYearOptions,
} from "@/components/shared/calls";
import { CallFeedbackDialog } from "@/components/staff/CallFeedbackDialog";
import { content } from "@/content/en";
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
  initialCalls?: import("@/types").StaffCallListResponse;
  initialCallsParams?: GetStaffCallsParams;
}

export function StaffCallList({
  copy,
  emptyMessage,
  initialCalls,
  initialCallsParams,
}: StaffCallListProps) {
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

  const { data, isLoading, isError, refetch } = useStaffCalls(queryParams, {
    initialData: initialCalls,
    initialParams: initialCallsParams,
  });
  const revealPhone = useRevealStaffCallPhone();
  const submitOutcome = useSubmitStaffCallOutcome();

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

  function resetPage<T extends string>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  function handleYearChange(nextYear: number) {
    setYear(nextYear);
    setMonth(nextYear === currentYear ? currentMonth : 1);
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
          toast({ title: copy.calls.dialog.feedbackSaved });
          handleCloseDialog(false);
        },
        onError: () => {
          toast({ title: content.errors.generic, description: copy.calls.loadError });
        },
      },
    );
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const cardLabels = {
    valueTierLabels: copy.calls.valueTierLabels,
    queueStatusLabels: copy.calls.queueStatusLabels,
    callOutcomeLabels: copy.calls.callOutcomeLabels,
    purchaseStatusLabels: copy.calls.purchaseStatusLabels,
    customerTypeLabels: copy.calls.customerTypeLabels,
    notesLabel: copy.calls.notesLabel,
    due: copy.calls.due,
    call: copy.calls.call,
  };

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
        <YearMonthFilters
          year={year}
          month={month}
          yearLabel={copy.calls.yearLabel}
          monthLabels={copy.calls.monthLabels}
          monthGroupLabel={copy.calls.monthLabel}
          yearOptions={yearOptions}
          getMonthCount={getMonthCount}
          onYearChange={handleYearChange}
          onMonthChange={(value) => {
            setMonth(value);
            setPage(1);
          }}
        />
      </div>

      <CallQueueFilters
        queueLabel={copy.calls.queueLabel}
        segmentLabel={copy.calls.segmentLabel}
        valueTierLabel={copy.calls.valueTierLabel}
        queues={copy.calls.queues}
        segments={copy.calls.segments}
        valueTiers={copy.calls.valueTiers}
        queue={queue}
        segment={segment}
        valueTier={valueTier}
        getFilterCount={getFilterCount}
        onQueueChange={(value) => resetPage(setQueue, value as StaffCallQueue)}
        onSegmentChange={(value) => resetPage(setSegment, value as StaffCallSegment)}
        onValueTierChange={(value) => resetPage(setValueTier, value as StaffCallValueTier)}
      />

      <QueryLoadState
        isLoading={isLoading}
        isError={isError}
        loadingLabel={content.common.loading}
        errorLabel={copy.calls.loadError}
        retryLabel={content.errors.tryAgain}
        onRetry={() => void refetch()}
      >
        {!data || data.data.length === 0 ? (
          <EmptyState
            message={
              segment === "ALL" && valueTier === "ALL" && queue === "ALL"
                ? copy.calls.noCustomersYet
                : emptyMessage
            }
          />
        ) : (
          <div className="space-y-3">
            {data.data.map((item) => (
              <StaffCallCard
                key={item.visitId}
                item={item}
                labels={cardLabels}
                onCall={(callItem) => void handleOpenCall(callItem)}
              />
            ))}
          </div>
        )}
      </QueryLoadState>

      {data && totalPages > 1 && (
        <LogPagination
          page={page}
          totalPages={totalPages}
          showingLabel=""
          pageLabel={copy.calls.pageLabel
            .replace("{page}", String(page))
            .replace("{total}", String(totalPages))}
          previousLabel={copy.calls.previousPage}
          nextLabel={copy.calls.nextPage}
          onPageChange={setPage}
        />
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
