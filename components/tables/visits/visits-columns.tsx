import type { ColumnDef } from "@tanstack/react-table";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDurationMins,
  maskPhone,
} from "@/lib/utils/formatters";
import { boolLabel, formatProducts, labelFor } from "@/lib/utils/visit-display";
import type { VisitListItem } from "@/types";
import type { VisitColumnLabels } from "./types";

export function buildVisitColumns({
  copy,
  fieldLabels,
  productLabels,
  yesLabel,
  noLabel,
}: VisitColumnLabels): ColumnDef<VisitListItem>[] {
  return [
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
  ];
}
