import { downloadCsv } from "@/components/shared/ExportButton";
import { formatPercent } from "@/lib/utils/formatters";
import type { StoreFieldSaleStaffRow } from "@/types";

interface ExportFieldStaffBreakdownParams {
  rows: StoreFieldSaleStaffRow[];
  headers: {
    staff: string;
    totalVisits: string;
    enrolled: string;
    enrollmentRate: string;
    followUpNeeded: string;
    followUpsConverted: string;
    uniqueAreas: string;
    notes: string;
  };
  periodLabel: string;
}

export function exportFieldStaffBreakdownCsv({
  rows,
  headers,
  periodLabel,
}: ExportFieldStaffBreakdownParams): void {
  const safePeriod = periodLabel.replace(/\s+/g, "-").toLowerCase();
  downloadCsv(
    `field-sales-staff-${safePeriod}.csv`,
    [
      headers.staff,
      headers.totalVisits,
      headers.enrolled,
      headers.enrollmentRate,
      headers.followUpNeeded,
      headers.followUpsConverted,
      headers.uniqueAreas,
      headers.notes,
    ],
    rows.map((row) => [
      row.staffName,
      String(row.totalVisits),
      String(row.enrolled),
      formatPercent(row.enrollmentRatePercent),
      String(row.followUpNeeded),
      String(row.followUpsConverted),
      String(row.uniqueAreas),
      String(row.visitsWithNotes),
    ]),
  );
}
