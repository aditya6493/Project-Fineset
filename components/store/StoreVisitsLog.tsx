"use client";

import { useState } from "react";
import { useVisits } from "@/hooks/useVisits";
import { VisitsTable } from "@/components/tables/VisitsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Content } from "@/content/en";

type StoreContent = Content["store"];
type VisitFormFields = Content["visitForm"]["fields"];
type CommonContent = Content["common"];

interface StoreVisitsLogProps {
  store: StoreContent;
  visitFields: VisitFormFields;
  common: CommonContent;
  emptyMessage: string;
}

type VisitFilter = "all" | "followUpOnly";

export function StoreVisitsLog({
  store,
  visitFields,
  common,
  emptyMessage,
}: StoreVisitsLogProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visitFilter, setVisitFilter] = useState<VisitFilter>("all");

  const { data, isLoading } = useVisits({
    page: String(page),
    pageSize: "20",
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    followUpOnly: visitFilter === "followUpOnly" ? "true" : undefined,
  });

  const filters: Array<{ key: VisitFilter; label: string }> = [
    { key: "all", label: store.visits.filters.all },
    { key: "followUpOnly", label: store.visits.filters.followUpOnly },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.key}
            type="button"
            size="sm"
            variant={visitFilter === item.key ? "default" : "outline"}
            onClick={() => {
              setVisitFilter(item.key);
              setPage(1);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

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
        fieldLabels={visitFields}
        isLoading={isLoading}
      />
    </div>
  );
}
