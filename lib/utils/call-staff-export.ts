import { downloadCsv } from "@/components/shared/ExportButton";
import { formatPercent } from "@/lib/utils/formatters";
import type { StoreCallStaffRow } from "@/types";

interface ExportStaffCallBreakdownParams {
  rows: StoreCallStaffRow[];
  headers: {
    staff: string;
    totalCalls: string;
    answered: string;
    notAnswered: string;
    answerRate: string;
    callToConversion: string;
    uniqueVisits: string;
    feedback: string;
  };
  periodLabel: string;
}

export function exportStaffCallBreakdownCsv({
  rows,
  headers,
  periodLabel,
}: ExportStaffCallBreakdownParams): void {
  const safePeriod = periodLabel.replace(/\s+/g, "-").toLowerCase();
  downloadCsv(
    `call-staff-breakdown-${safePeriod}.csv`,
    [
      headers.staff,
      headers.totalCalls,
      headers.answered,
      headers.notAnswered,
      headers.answerRate,
      headers.callToConversion,
      headers.uniqueVisits,
      headers.feedback,
    ],
    rows.map((row) => [
      row.staffName,
      String(row.totalCalls),
      String(row.answered),
      String(row.notAnswered),
      formatPercent(row.answerRatePercent),
      row.answered > 0 ? formatPercent(row.callToConversionPercent) : "",
      String(row.uniqueVisitsCalled),
      String(row.callsWithFeedback),
    ]),
  );
}
