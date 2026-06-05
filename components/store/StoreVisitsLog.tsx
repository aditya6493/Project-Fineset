"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getStaff } from "@/lib/api/staff";
import { STAFF_FILTER_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useImportVisitsCsv, useVisits } from "@/hooks/useVisits";
import { VisitsTable } from "@/components/tables/VisitsTable";
import { QueryLoadState } from "@/components/shared/QueryLoadState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Content } from "@/content/en";
import type {
  GetVisitsParams,
  PaginatedResponse,
  VisitListItem,
  VisitsColumnFilters,
} from "@/types";

type StoreContent = Content["store"];
type VisitFormFields = Content["visitForm"]["fields"];
type CommonContent = Content["common"];

interface StoreVisitsLogProps {
  store: StoreContent;
  storeId: string;
  visitFields: VisitFormFields;
  common: CommonContent;
  emptyMessage: string;
  initialVisits?: PaginatedResponse<VisitListItem>;
  initialVisitsParams?: GetVisitsParams;
  initialStaff?: Awaited<ReturnType<typeof getStaff>>;
  backHref?: string;
  backLabel?: string;
}

type VisitFilter = "all" | "followUpOnly";

export function StoreVisitsLog({
  store,
  storeId,
  visitFields,
  common,
  emptyMessage,
  initialVisits,
  initialVisitsParams,
  initialStaff,
  backHref,
  backLabel,
}: StoreVisitsLogProps) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visitFilter, setVisitFilter] = useState<VisitFilter>("all");
  const [columnFilters, setColumnFilters] = useState<VisitsColumnFilters>({});
  const [importStatus, setImportStatus] = useState<{
    tone: "default" | "success" | "error";
    message: string;
  } | null>(null);

  const queryParams: GetVisitsParams = {
    page: String(page),
    pageSize: "20",
    storeId,
    search: debouncedSearch.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    followUpOnly: visitFilter === "followUpOnly" ? "true" : undefined,
    staffId: columnFilters.staffId,
    purchaseStatus: columnFilters.purchaseStatus,
    visitType: columnFilters.visitType,
    customerType: columnFilters.customerType,
    sourceChannel: columnFilters.sourceChannel,
  };

  const staffHydrated = initialStaff !== undefined;
  const { data: staffList } = useQuery({
    queryKey: ["staff", "visits-filters", storeId],
    queryFn: () => getStaff(storeId),
    enabled: Boolean(storeId),
    initialData: initialStaff,
    ...STAFF_FILTER_QUERY_OPTIONS,
    ...queryOptionsForHydration(staffHydrated),
  });

  const { data, isLoading, isFetching, isError, refetch } = useVisits(queryParams, {
    initialData: initialVisits,
    initialParams: initialVisitsParams,
  });
  const importCsvMutation = useImportVisitsCsv();

  const filters: Array<{ key: VisitFilter; label: string }> = [
    { key: "all", label: store.visits.filters.all },
    { key: "followUpOnly", label: store.visits.filters.followUpOnly },
  ];

  return (
    <div className="space-y-4">
      <div>
        {backHref ? (
          <Link
            href={backHref}
            prefetch={false}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-brand-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel ?? store.storeDetail.backToPortfolio}
          </Link>
        ) : null}
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {store.visits.title}
        </h1>
      </div>

      <Tabs
        value={visitFilter}
        onValueChange={(value) => {
          setVisitFilter(value as VisitFilter);
          setPage(1);
        }}
      >
        <TabsList aria-label={store.visits.title}>
          {filters.map((item) => (
            <TabsTrigger key={item.key} value={item.key}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <Label htmlFor="startDate">{store.visits.filters.startDate}</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endDate">{store.visits.filters.endDate}</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <QueryLoadState
        isLoading={isLoading && !data}
        isError={isError}
        errorLabel={common.noResults}
        retryLabel={common.confirm}
        onRetry={() => void refetch()}
      >
        <VisitsTable
          copy={{
            ...store.visits,
            showing: store.table.showing,
            page: store.table.page,
          }}
          emptyMessage={emptyMessage}
          searchPlaceholder={store.visits.searchPlaceholder}
          previousLabel={common.previous}
          nextLabel={common.next}
          yesLabel={store.table.yes}
          noLabel="No"
          data={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={20}
          search={searchInput}
          isSearching={isFetching && Boolean(debouncedSearch.trim())}
          onSearchChange={(value) => {
            setSearchInput(value);
            setPage(1);
          }}
          onPageChange={setPage}
          onImportCsv={(file) => {
            setImportStatus({
              tone: "default",
              message: store.visits.importHint,
            });
            importCsvMutation.mutate(file, {
              onSuccess: (result) => {
                if (result.failedCount === 0) {
                  setImportStatus({
                    tone: "success",
                    message: store.visits.importSuccess.replace(
                      "{count}",
                      String(result.createdCount),
                    ),
                  });
                } else if (result.createdCount > 0) {
                  setImportStatus({
                    tone: "error",
                    message: store.visits.importPartial
                      .replace("{created}", String(result.createdCount))
                      .replace("{failed}", String(result.failedCount)),
                  });
                } else {
                  setImportStatus({
                    tone: "error",
                    message: store.visits.importFailed,
                  });
                }
                void refetch();
              },
              onError: (error) => {
                setImportStatus({
                  tone: "error",
                  message: error.message || store.visits.importFailed,
                });
              },
            });
          }}
          isImportingCsv={importCsvMutation.isPending}
          importStatusMessage={importStatus?.message}
          importStatusTone={importStatus?.tone}
          fieldLabels={visitFields}
          isLoading={isFetching && Boolean(data?.data.length)}
          columnFilters={columnFilters}
          onColumnFiltersChange={(next) => {
            setColumnFilters(next);
            setPage(1);
          }}
          staffOptions={(staffList ?? []).map((s) => ({ id: s.id, name: s.name }))}
          filterAllLabel={store.visits.filters.columnAll}
        />
      </QueryLoadState>
    </div>
  );
}
