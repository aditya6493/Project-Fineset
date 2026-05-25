"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { getVisitById } from "@/lib/api/visits";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  maskPhone,
} from "@/lib/utils/formatters";
import type { VisitListItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExportButton, downloadCsv } from "@/components/shared/ExportButton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Visit } from "@prisma/client";

interface VisitsTableCopy {
  title: string;
  columns: {
    visitId: string;
    date: string;
    staff: string;
    customer: string;
    phone: string;
    type: string;
    status: string;
    revenue: string;
    products: string;
    followUp: string;
    notes: string;
  };
  detailTitle: string;
  exportCsv: string;
  showing: string;
  page: string;
}

interface VisitsTableProps {
  copy: VisitsTableCopy;
  emptyMessage: string;
  searchPlaceholder: string;
  previousLabel: string;
  nextLabel: string;
  yesLabel: string;
  data: VisitListItem[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  statusLabels: Record<string, string>;
  typeLabels: Record<string, string>;
  isLoading?: boolean;
}

export function VisitsTable({
  copy,
  emptyMessage,
  searchPlaceholder,
  previousLabel,
  nextLabel,
  yesLabel,
  data,
  total,
  page,
  pageSize,
  search,
  onSearchChange,
  onPageChange,
  statusLabels,
  typeLabels,
  isLoading,
}: VisitsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [visitDetail, setVisitDetail] = useState<Visit | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const columns = useMemo<ColumnDef<VisitListItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: copy.columns.visitId,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span>
        ),
      },
      {
        accessorKey: "visitDate",
        header: copy.columns.date,
        cell: ({ row }) => formatDate(row.original.visitDate),
      },
      { accessorKey: "staffName", header: copy.columns.staff },
      { accessorKey: "customerName", header: copy.columns.customer },
      {
        accessorKey: "customerPhone",
        header: copy.columns.phone,
        cell: ({ row }) => maskPhone(row.original.customerPhone),
      },
      {
        accessorKey: "visitType",
        header: copy.columns.type,
        cell: ({ row }) => typeLabels[row.original.visitType] ?? row.original.visitType,
      },
      {
        accessorKey: "purchaseStatus",
        header: copy.columns.status,
        cell: ({ row }) =>
          statusLabels[row.original.purchaseStatus] ?? row.original.purchaseStatus,
      },
      {
        accessorKey: "transactionAmount",
        header: copy.columns.revenue,
        cell: ({ row }) =>
          row.original.transactionAmount
            ? formatCurrency(row.original.transactionAmount)
            : "—",
      },
      {
        id: "products",
        header: copy.columns.products,
        cell: ({ row }) =>
          row.original.productsPurchased.length > 0
            ? row.original.productsPurchased.join(", ")
            : row.original.productsExplored.join(", ") || "—",
      },
      {
        accessorKey: "followUpNeeded",
        header: copy.columns.followUp,
        cell: ({ row }) => (row.original.followUpNeeded ? yesLabel : "—"),
      },
    ],
    [copy.columns, statusLabels, typeLabels, yesLabel],
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

  async function openDetail(visitId: string) {
    setSelectedVisitId(visitId);
    setDetailLoading(true);
    try {
      const detail = await getVisitById(visitId);
      setVisitDetail(detail);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedVisitId(null);
    setVisitDetail(null);
  }

  function handleExport() {
    downloadCsv(
      "visits-export.csv",
      Object.values(copy.columns),
      data.map((visit) => [
        visit.id,
        formatDateTime(visit.visitDate),
        visit.staffName,
        visit.customerName,
        maskPhone(visit.customerPhone),
        typeLabels[visit.visitType] ?? visit.visitType,
        statusLabels[visit.purchaseStatus] ?? visit.purchaseStatus,
        visit.transactionAmount ? String(visit.transactionAmount) : "",
        visit.productsPurchased.join("; "),
        visit.followUpNeeded ? "Yes" : "No",
        visit.staffNotes ?? "",
      ]),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {copy.title}
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="sm:w-64"
          />
          <ExportButton
            label={copy.exportCsv}
            onExport={handleExport}
            disabled={data.length === 0}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-card bg-surface-secondary" />
      ) : data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card shadow-card">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-medium text-text-secondary"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-secondary/50"
                  onClick={() => openDetail(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">
          {copy.showing
            .replace("{from}", String(from))
            .replace("{to}", String(to))
            .replace("{total}", String(total))}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {previousLabel}
          </Button>
          <span className="text-sm text-text-secondary">
            {copy.page.replace("{page}", String(page))}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {nextLabel}
          </Button>
        </div>
      </div>

      <Dialog open={selectedVisitId !== null} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{copy.detailTitle}</DialogTitle>
          </DialogHeader>
          {detailLoading || !visitDetail ? (
            <div className="h-32 animate-pulse rounded-card bg-surface-secondary" />
          ) : (
            <dl className="grid gap-3 text-sm">
              <DetailRow label={copy.columns.date} value={formatDateTime(visitDetail.visitDate)} />
              <DetailRow label={copy.columns.customer} value={visitDetail.customerName} />
              <DetailRow label={copy.columns.phone} value={maskPhone(visitDetail.customerPhone)} />
              <DetailRow
                label={copy.columns.status}
                value={statusLabels[visitDetail.purchaseStatus] ?? visitDetail.purchaseStatus}
              />
              <DetailRow
                label={copy.columns.revenue}
                value={
                  visitDetail.transactionAmount
                    ? formatCurrency(visitDetail.transactionAmount)
                    : "—"
                }
              />
              <DetailRow
                label={copy.columns.products}
                value={
                  visitDetail.productsPurchased.length > 0
                    ? visitDetail.productsPurchased.join(", ")
                    : visitDetail.productsExplored.join(", ")
                }
              />
              {visitDetail.staffNotes && (
                <DetailRow label={copy.columns.notes} value={visitDetail.staffNotes} />
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-border pb-2 last:border-0">
      <dt className="font-medium text-text-secondary">{label}</dt>
      <dd className="col-span-2 text-text-primary">{value}</dd>
    </div>
  );
}
