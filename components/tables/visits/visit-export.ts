import {
  formatDate,
  formatDateTime,
  formatDurationMins,
  maskPhone,
} from "@/lib/utils/formatters";
import { boolLabel, formatProducts, labelFor } from "@/lib/utils/visit-display";
import { downloadCsv } from "@/components/shared/ExportButton";
import type { VisitListItem } from "@/types";
import type { VisitFormFields, VisitsCopy } from "./types";

interface ExportVisitsParams {
  copy: VisitsCopy;
  data: VisitListItem[];
  fieldLabels: VisitFormFields;
  productLabels: Record<string, string>;
  yesLabel: string;
  noLabel: string;
}

export function exportVisitsCsv({
  copy,
  data,
  fieldLabels,
  productLabels,
  yesLabel,
  noLabel,
}: ExportVisitsParams): void {
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
