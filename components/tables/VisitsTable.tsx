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
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDurationMins,
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
import type { Content } from "@/content/en";

type VisitFormFields = Content["visitForm"]["fields"];
type VisitsCopy = Content["store"]["visits"];

interface VisitsTableProps {
  copy: VisitsCopy & { showing: string; page: string };
  emptyMessage: string;
  searchPlaceholder: string;
  previousLabel: string;
  nextLabel: string;
  yesLabel: string;
  noLabel: string;
  data: VisitListItem[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  fieldLabels: VisitFormFields;
  isLoading?: boolean;
}

function labelFor(
  options: Record<string, string> | undefined,
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return options?.[value] ?? value;
}

function formatProducts(items: string[], options: Record<string, string>): string {
  if (items.length === 0) return "—";
  return items.map((item) => options[item] ?? item).join(", ");
}

function boolLabel(value: boolean, yesLabel: string, noLabel: string): string {
  return value ? yesLabel : noLabel;
}

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
      {
        accessorKey: "inTime",
        header: copy.columns.inTime,
        cell: ({ row }) =>
          row.original.inTime ? formatDateTime(row.original.inTime) : "—",
      },
      {
        accessorKey: "outTime",
        header: copy.columns.outTime,
        cell: ({ row }) =>
          row.original.outTime ? formatDateTime(row.original.outTime) : "—",
      },
      {
        accessorKey: "durationMins",
        header: copy.columns.duration,
        cell: ({ row }) =>
          row.original.durationMins != null
            ? formatDurationMins(row.original.durationMins)
            : "—",
      },
      { accessorKey: "staffName", header: copy.columns.staff },
      { accessorKey: "customerName", header: copy.columns.customer },
      {
        accessorKey: "customerPhone",
        header: copy.columns.phone,
        cell: ({ row }) => maskPhone(row.original.customerPhone),
      },
      {
        accessorKey: "customerType",
        header: copy.columns.customerType,
        cell: ({ row }) =>
          labelFor(fieldLabels.customerType.options, row.original.customerType),
      },
      {
        accessorKey: "visitType",
        header: copy.columns.type,
        cell: ({ row }) =>
          labelFor(fieldLabels.visitType.options, row.original.visitType),
      },
      {
        accessorKey: "sourceChannel",
        header: copy.columns.sourceChannel,
        cell: ({ row }) =>
          labelFor(fieldLabels.sourceChannel.options, row.original.sourceChannel),
      },
      {
        accessorKey: "area",
        header: copy.columns.area,
        cell: ({ row }) => row.original.area ?? "—",
      },
      {
        accessorKey: "gender",
        header: copy.columns.gender,
        cell: ({ row }) =>
          labelFor(fieldLabels.gender.options, row.original.gender),
      },
      {
        accessorKey: "ageGroup",
        header: copy.columns.ageGroup,
        cell: ({ row }) =>
          labelFor(fieldLabels.ageGroup.options, row.original.ageGroup),
      },
      {
        accessorKey: "purchaseStatus",
        header: copy.columns.status,
        cell: ({ row }) =>
          labelFor(fieldLabels.purchaseStatus.options, row.original.purchaseStatus),
      },
      {
        id: "productsExplored",
        header: copy.columns.productsExplored,
        cell: ({ row }) =>
          formatProducts(row.original.productsExplored, productLabels),
      },
      {
        id: "productsPurchased",
        header: copy.columns.productsPurchased,
        cell: ({ row }) =>
          formatProducts(row.original.productsPurchased, productLabels),
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
        accessorKey: "intentTier",
        header: copy.columns.intentTier,
        cell: ({ row }) =>
          labelFor(fieldLabels.intentTier.options, row.original.intentTier),
      },
      {
        accessorKey: "reasonNoPurchase",
        header: copy.columns.reasonNoPurchase,
        cell: ({ row }) =>
          labelFor(
            fieldLabels.reasonNoPurchase.options,
            row.original.reasonNoPurchase,
          ),
      },
      {
        accessorKey: "competitorMention",
        header: copy.columns.competitorMention,
        cell: ({ row }) => row.original.competitorMention ?? "—",
      },
      {
        accessorKey: "purchaseOccasion",
        header: copy.columns.purchaseOccasion,
        cell: ({ row }) =>
          labelFor(
            fieldLabels.purchaseOccasion.options,
            row.original.purchaseOccasion,
          ),
      },
      {
        accessorKey: "metalKtPref",
        header: copy.columns.metalKtPref,
        cell: ({ row }) =>
          labelFor(fieldLabels.metalKtPref.options, row.original.metalKtPref),
      },
      {
        accessorKey: "budgetStated",
        header: copy.columns.budgetStated,
        cell: ({ row }) =>
          labelFor(fieldLabels.budgetStated.options, row.original.budgetStated),
      },
      {
        accessorKey: "schemeEnrolled",
        header: copy.columns.schemeEnrolled,
        cell: ({ row }) =>
          boolLabel(row.original.schemeEnrolled, yesLabel, noLabel),
      },
      {
        accessorKey: "ghsPolicy",
        header: copy.columns.ghsPolicy,
        cell: ({ row }) => boolLabel(row.original.ghsPolicy, yesLabel, noLabel),
      },
      {
        accessorKey: "followUpNeeded",
        header: copy.columns.followUp,
        cell: ({ row }) =>
          boolLabel(row.original.followUpNeeded, yesLabel, noLabel),
      },
      {
        accessorKey: "followUpDate",
        header: copy.columns.followUpDate,
        cell: ({ row }) =>
          row.original.followUpDate ? formatDate(row.original.followUpDate) : "—",
      },
      {
        accessorKey: "followUpStatus",
        header: copy.columns.followUpStatus,
        cell: ({ row }) => row.original.followUpStatus ?? "—",
      },
      {
        accessorKey: "staffNotes",
        header: copy.columns.notes,
        cell: ({ row }) => row.original.staffNotes ?? "—",
      },
    ],
    [copy.columns, fieldLabels, productLabels, yesLabel, noLabel],
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

  function handleExport() {
    const headers = Object.values(copy.columns);
    downloadCsv(
      "visits-export.csv",
      headers,
      data.map((visit) => [
        visit.id,
        formatDateTime(visit.visitDate),
        visit.inTime ? formatDateTime(visit.inTime) : "",
        visit.outTime ? formatDateTime(visit.outTime) : "",
        visit.durationMins != null ? formatDurationMins(visit.durationMins) : "",
        visit.staffName,
        visit.customerName,
        maskPhone(visit.customerPhone),
        labelFor(fieldLabels.customerType.options, visit.customerType),
        labelFor(fieldLabels.visitType.options, visit.visitType),
        labelFor(fieldLabels.sourceChannel.options, visit.sourceChannel),
        visit.area ?? "",
        labelFor(fieldLabels.gender.options, visit.gender),
        labelFor(fieldLabels.ageGroup.options, visit.ageGroup),
        labelFor(fieldLabels.purchaseStatus.options, visit.purchaseStatus),
        formatProducts(visit.productsExplored, productLabels),
        formatProducts(visit.productsPurchased, productLabels),
        visit.transactionAmount ? String(visit.transactionAmount) : "",
        labelFor(fieldLabels.intentTier.options, visit.intentTier),
        labelFor(fieldLabels.reasonNoPurchase.options, visit.reasonNoPurchase),
        visit.competitorMention ?? "",
        labelFor(fieldLabels.purchaseOccasion.options, visit.purchaseOccasion),
        labelFor(fieldLabels.metalKtPref.options, visit.metalKtPref),
        labelFor(fieldLabels.budgetStated.options, visit.budgetStated),
        boolLabel(visit.schemeEnrolled, yesLabel, noLabel),
        boolLabel(visit.ghsPolicy, yesLabel, noLabel),
        boolLabel(visit.followUpNeeded, yesLabel, noLabel),
        visit.followUpDate ? formatDate(visit.followUpDate) : "",
        visit.followUpStatus ?? "",
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
          <table className="w-full min-w-[2400px] text-left text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 font-medium text-text-secondary"
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
                  onClick={() => setSelectedVisit(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-4 py-3 text-text-primary"
                    >
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

      <Dialog
        open={selectedVisit !== null}
        onOpenChange={(open) => !open && setSelectedVisit(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{copy.detailTitle}</DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-6 text-sm">
              <DetailSection title={copy.sections.customer}>
                <DetailRow
                  label={copy.columns.date}
                  value={formatDateTime(selectedVisit.visitDate)}
                />
                <DetailRow
                  label={copy.columns.customer}
                  value={selectedVisit.customerName}
                />
                <DetailRow
                  label={copy.columns.phone}
                  value={maskPhone(selectedVisit.customerPhone)}
                />
                <DetailRow
                  label={copy.columns.customerType}
                  value={labelFor(
                    fieldLabels.customerType.options,
                    selectedVisit.customerType,
                  )}
                />
                <DetailRow
                  label={copy.columns.type}
                  value={labelFor(
                    fieldLabels.visitType.options,
                    selectedVisit.visitType,
                  )}
                />
                <DetailRow
                  label={copy.columns.inTime}
                  value={
                    selectedVisit.inTime
                      ? formatDateTime(selectedVisit.inTime)
                      : "—"
                  }
                />
                <DetailRow
                  label={copy.columns.outTime}
                  value={
                    selectedVisit.outTime
                      ? formatDateTime(selectedVisit.outTime)
                      : "—"
                  }
                />
                <DetailRow
                  label={copy.columns.duration}
                  value={
                    selectedVisit.durationMins != null
                      ? formatDurationMins(selectedVisit.durationMins)
                      : "—"
                  }
                />
                <DetailRow
                  label={copy.columns.sourceChannel}
                  value={labelFor(
                    fieldLabels.sourceChannel.options,
                    selectedVisit.sourceChannel,
                  )}
                />
                <DetailRow
                  label={copy.columns.area}
                  value={selectedVisit.area ?? "—"}
                />
                <DetailRow
                  label={copy.columns.gender}
                  value={labelFor(fieldLabels.gender.options, selectedVisit.gender)}
                />
                <DetailRow
                  label={copy.columns.ageGroup}
                  value={labelFor(
                    fieldLabels.ageGroup.options,
                    selectedVisit.ageGroup,
                  )}
                />
                <DetailRow label={copy.columns.staff} value={selectedVisit.staffName} />
              </DetailSection>

              <DetailSection title={copy.sections.visit}>
                <DetailRow
                  label={copy.columns.status}
                  value={labelFor(
                    fieldLabels.purchaseStatus.options,
                    selectedVisit.purchaseStatus,
                  )}
                />
                <DetailRow
                  label={copy.columns.productsExplored}
                  value={formatProducts(
                    selectedVisit.productsExplored,
                    productLabels,
                  )}
                />
                <DetailRow
                  label={copy.columns.productsPurchased}
                  value={formatProducts(
                    selectedVisit.productsPurchased,
                    productLabels,
                  )}
                />
                <DetailRow
                  label={copy.columns.revenue}
                  value={
                    selectedVisit.transactionAmount
                      ? formatCurrency(selectedVisit.transactionAmount)
                      : "—"
                  }
                />
                <DetailRow
                  label={copy.columns.intentTier}
                  value={labelFor(
                    fieldLabels.intentTier.options,
                    selectedVisit.intentTier,
                  )}
                />
              </DetailSection>

              {selectedVisit.purchaseStatus === "NOT_PURCHASED" && (
                <DetailSection title={copy.sections.noPurchase}>
                  <DetailRow
                    label={copy.columns.reasonNoPurchase}
                    value={labelFor(
                      fieldLabels.reasonNoPurchase.options,
                      selectedVisit.reasonNoPurchase,
                    )}
                  />
                  <DetailRow
                    label={copy.columns.competitorMention}
                    value={selectedVisit.competitorMention ?? "—"}
                  />
                </DetailSection>
              )}

              <DetailSection title={copy.sections.preferences}>
                <DetailRow
                  label={copy.columns.purchaseOccasion}
                  value={labelFor(
                    fieldLabels.purchaseOccasion.options,
                    selectedVisit.purchaseOccasion,
                  )}
                />
                <DetailRow
                  label={copy.columns.metalKtPref}
                  value={labelFor(
                    fieldLabels.metalKtPref.options,
                    selectedVisit.metalKtPref,
                  )}
                />
                <DetailRow
                  label={copy.columns.budgetStated}
                  value={labelFor(
                    fieldLabels.budgetStated.options,
                    selectedVisit.budgetStated,
                  )}
                />
                <DetailRow
                  label={copy.columns.schemeEnrolled}
                  value={boolLabel(
                    selectedVisit.schemeEnrolled,
                    yesLabel,
                    noLabel,
                  )}
                />
                <DetailRow
                  label={copy.columns.ghsPolicy}
                  value={boolLabel(selectedVisit.ghsPolicy, yesLabel, noLabel)}
                />
              </DetailSection>

              <DetailSection title={copy.sections.followUp}>
                <DetailRow
                  label={copy.columns.followUp}
                  value={boolLabel(
                    selectedVisit.followUpNeeded,
                    yesLabel,
                    noLabel,
                  )}
                />
                <DetailRow
                  label={copy.columns.followUpDate}
                  value={
                    selectedVisit.followUpDate
                      ? formatDate(selectedVisit.followUpDate)
                      : "—"
                  }
                />
                <DetailRow
                  label={copy.columns.followUpStatus}
                  value={selectedVisit.followUpStatus ?? "—"}
                />
                <DetailRow
                  label={copy.columns.notes}
                  value={selectedVisit.staffNotes ?? "—"}
                />
              </DetailSection>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 font-medium text-text-primary">{title}</h3>
      <dl className="grid gap-2">{children}</dl>
    </section>
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
