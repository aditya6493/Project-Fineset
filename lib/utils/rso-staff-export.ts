import { downloadCsv } from "@/components/shared/ExportButton";
import { formatPercent } from "@/lib/utils/formatters";
import type { RsoPerformanceRow } from "@/types";

interface ExportRsoStaffBreakdownParams {
  rows: RsoPerformanceRow[];
  headers: {
    staff: string;
    customersAttended: string;
    purchased: string;
    notPurchased: string;
    schemesEnrolled: string;
    dataEntryScore: string;
    growth: string;
    revenue: string;
  };
  periodLabel: string;
}

export function exportRsoStaffBreakdownCsv({
  rows,
  headers,
  periodLabel,
}: ExportRsoStaffBreakdownParams): void {
  const safePeriod = periodLabel.replace(/\s+/g, "-").toLowerCase();
  downloadCsv(
    `rso-performance-${safePeriod}.csv`,
    [
      headers.staff,
      headers.customersAttended,
      headers.purchased,
      headers.notPurchased,
      headers.schemesEnrolled,
      headers.dataEntryScore,
      headers.growth,
      headers.revenue,
    ],
    rows.map((row) => [
      row.staffName,
      String(row.customersAttended),
      String(row.purchased),
      String(row.notPurchased),
      String(row.schemesEnrolled),
      row.dataEntryScoreLabel,
      row.growthLabel,
      row.revenueLabel,
    ]),
  );
}

export function rsoConversionPercent(row: RsoPerformanceRow): number {
  if (row.customersAttended === 0) return 0;
  return Math.round((row.purchased / row.customersAttended) * 1000) / 10;
}

export function rsoConversionLabel(row: RsoPerformanceRow): string {
  return formatPercent(rsoConversionPercent(row));
}
