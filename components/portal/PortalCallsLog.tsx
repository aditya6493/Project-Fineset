"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePortalCalls } from "@/hooks/usePortalCalls";
import { getStaff, getStaffPerformance } from "@/lib/api/staff";
import { getStores } from "@/lib/api/stores";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { QueryLoadState } from "@/components/shared/QueryLoadState";
import {
  CallQueueFilters,
  LogPagination,
  PortalCallCard,
  StoreStaffFilters,
  YearMonthFilters,
  buildYearOptions,
} from "@/components/shared/calls";
import type { Content } from "@/content/en";
import { content } from "@/content/en";
import type {
  GetPortalCallsParams,
  PortalCallListResponse,
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
  initialPortalCalls?: PortalCallListResponse;
  initialPortalCallsParams?: GetPortalCallsParams;
}

export function PortalCallsLog({
  copy,
  common,
  emptyMessage,
  allStoresLabel,
  allStaffLabel,
  showStoreFilter = false,
  initialStoreId,
  initialPortalCalls,
  initialPortalCallsParams,
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

  const { data, isLoading, isError, refetch } = usePortalCalls(queryParams, {
    initialData: initialPortalCalls,
    initialParams: initialPortalCallsParams,
  });

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

  function resetPage<T extends string>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  function handleYearChange(nextYear: number) {
    setYear(nextYear);
    setMonth(nextYear === currentYear ? currentMonth : 1);
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
        <StoreStaffFilters
          showStoreFilter={showStoreFilter}
          storeFilter={storeFilter}
          staffFilter={staffFilter}
          storeFilterLabel={copy.storeFilterLabel}
          staffFilterLabel={copy.staffFilterLabel}
          allStoresLabel={allStoresLabel}
          allStaffLabel={allStaffLabel}
          filterPlaceholder={common.filter}
          stores={stores?.data}
          staffOptions={staffOptions}
          onStoreChange={(value) => {
            setStoreFilter(value);
            setStaffFilter("all");
            setPage(1);
          }}
          onStaffChange={(value) => {
            setStaffFilter(value);
            setPage(1);
          }}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="calls-search">{copy.searchLabel}</Label>
        <Input
          id="calls-search"
          value={search}
          aria-label={copy.searchLabel}
          placeholder={copy.searchPlaceholder}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <YearMonthFilters
        year={year}
        month={month}
        yearLabel={copy.yearLabel}
        monthLabels={copy.monthLabels}
        yearOptions={yearOptions}
        getMonthCount={getMonthCount}
        onYearChange={handleYearChange}
        onMonthChange={(value) => {
          setMonth(value);
          setPage(1);
        }}
      />

      <CallQueueFilters
        queueLabel={copy.queueLabel}
        segmentLabel={copy.segmentLabel}
        valueTierLabel={copy.valueTierLabel}
        queues={copy.queues}
        segments={copy.segments}
        valueTiers={copy.valueTiers}
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
        loadingLabel={common.loading}
        errorLabel={copy.loadError}
        retryLabel={content.errors.tryAgain}
        onRetry={() => void refetch()}
      >
        {!data || data.data.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <div className="space-y-3">
            {data.data.map((item) => (
              <PortalCallCard
                key={item.visitId}
                item={item}
                showStoreName={showStoreFilter}
                labels={{
                  staff: copy.columns.staff,
                  due: copy.due,
                  notesLabel: copy.notesLabel,
                  queueStatusLabels: copy.queueStatusLabels,
                  callOutcomeLabels: copy.callOutcomeLabels,
                  purchaseStatusLabels: copy.purchaseStatusLabels,
                  customerTypeLabels: copy.customerTypeLabels,
                  valueTierLabels: copy.valueTierLabels,
                }}
              />
            ))}
          </div>
        )}
      </QueryLoadState>

      {data && data.total > data.pageSize && (
        <LogPagination
          page={page}
          totalPages={totalPages}
          showingLabel=""
          pageLabel={copy.pageLabel
            .replace("{page}", String(page))
            .replace("{total}", String(totalPages))}
          previousLabel={copy.previousPage}
          nextLabel={copy.nextPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
