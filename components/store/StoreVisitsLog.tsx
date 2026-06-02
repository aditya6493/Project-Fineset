"use client";

import { useState } from "react";
import { useImportVisitsCsv, useVisits } from "@/hooks/useVisits";
import { VisitsTable } from "@/components/tables/VisitsTable";
import { QueryLoadState } from "@/components/shared/QueryLoadState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Content } from "@/content/en";
import type { GetVisitsParams, PaginatedResponse, VisitListItem } from "@/types";

type StoreContent = Content["store"];
type VisitFormFields = Content["visitForm"]["fields"];
type CommonContent = Content["common"];

interface StoreVisitsLogProps {
  store: StoreContent;
  visitFields: VisitFormFields;
  common: CommonContent;
  emptyMessage: string;
  initialVisits?: PaginatedResponse<VisitListItem>;
  initialVisitsParams?: GetVisitsParams;
}

type VisitFilter = "all" | "followUpOnly";

export function StoreVisitsLog({
  store,
  visitFields,
  common,
  emptyMessage,
  initialVisits,
  initialVisitsParams,
}: StoreVisitsLogProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visitFilter, setVisitFilter] = useState<VisitFilter>("all");
  const [importStatus, setImportStatus] = useState<{
    tone: "default" | "success" | "error";
    message: string;
  } | null>(null);

  const queryParams = {
    page: String(page),
    pageSize: "20",
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    followUpOnly: visitFilter === "followUpOnly" ? "true" : undefined,
  };

  const { data, isLoading, isError, refetch } = useVisits(queryParams, {
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
        isLoading={isLoading}
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
          searchPlaceholder={common.search}
          previousLabel={common.previous}
          nextLabel={common.next}
          yesLabel={store.table.yes}
          noLabel="No"
          data={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={20}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
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
          isLoading={false}
        />
      </QueryLoadState>
    </div>
  );
}
