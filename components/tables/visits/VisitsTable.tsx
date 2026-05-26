"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import type { VisitListItem } from "@/types";
import { buildVisitColumns } from "./visits-columns";
import { VisitDetailDialog } from "./VisitDetailDialog";
import { VisitsTableToolbar } from "./VisitsTableToolbar";
import { VisitsTablePagination } from "./VisitsTablePagination";
import { exportVisitsCsv } from "./visit-export";
import type { VisitsTableProps } from "./types";

export function VisitsTable({
  copy,
  emptyMessage,
  searchPlaceholder,
  previousLabel,
  nextLabel,
  yesLabel,
  noLabel,
  data,
  total,
  page,
  pageSize,
  search,
  onSearchChange,
  onPageChange,
  fieldLabels,
  isLoading,
}: VisitsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedVisit, setSelectedVisit] = useState<VisitListItem | null>(null);

  const productLabels = fieldLabels.productsExplored.options;

  const columns = useMemo(
    () =>
      buildVisitColumns({
        copy,
        fieldLabels,
        productLabels,
        yesLabel,
        noLabel,
      }),
    [copy, fieldLabels, productLabels, yesLabel, noLabel],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const showingLabel = copy.showing
    .replace("{from}", String(from))
    .replace("{to}", String(to))
    .replace("{total}", String(total));

  const pageLabel = copy.page.replace("{page}", String(page));

  function handleExport() {
    exportVisitsCsv({
      copy,
      data,
      fieldLabels,
      productLabels,
      yesLabel,
      noLabel,
    });
  }

  return (
    <div className="space-y-4">
      <VisitsTableToolbar
        copy={copy}
        searchPlaceholder={searchPlaceholder}
        search={search}
        onSearchChange={onSearchChange}
        onExport={handleExport}
        exportDisabled={data.length === 0}
      />

      {isLoading ? (
        <div aria-live="polite" aria-busy="true">
          <Skeleton className="h-48 rounded-card" />
        </div>
      ) : data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card shadow-card">
          <Table className="min-w-[2400px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  aria-label={`View visit details for ${row.original.customerName}`}
                  onClick={() => setSelectedVisit(row.original)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedVisit(row.original);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <VisitsTablePagination
        showingLabel={showingLabel}
        pageLabel={pageLabel}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <VisitDetailDialog
        visit={selectedVisit}
        copy={copy}
        fieldLabels={fieldLabels}
        productLabels={productLabels}
        yesLabel={yesLabel}
        noLabel={noLabel}
        onClose={() => setSelectedVisit(null)}
      />
    </div>
  );
}

export type { VisitsTableProps } from "./types";
