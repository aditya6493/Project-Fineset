"use client";

import { useState } from "react";
import { useVisits } from "@/hooks/useVisits";
import { VisitsTable } from "@/components/tables/VisitsTable";
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

export function StoreVisitsLog({
  store,
  visitFields,
  common,
  emptyMessage,
}: StoreVisitsLogProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useVisits({
    page: String(page),
    pageSize: "20",
    search: search || undefined,
  });

  return (
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
      statusLabels={visitFields.purchaseStatus.options}
      typeLabels={visitFields.visitType.options}
      isLoading={isLoading}
    />
  );
}
