import type {
  AnalyticsSummary,
  AnalyticsTrendPoint,
  BreakdownRow,
  ComparisonTrendPoint,
} from "@/types/admin-business-analytics";

export type AnalyticsAskChartType =
  | "line"
  | "bar"
  | "pie"
  | "comparison"
  | "radar";

export interface AnalyticsAskRadarPoint {
  label: string;
  value: number;
  fullMark: number;
}

export interface AnalyticsAskChart {
  type: AnalyticsAskChartType;
  title: string;
  description?: string;
  trend?: AnalyticsTrendPoint[];
  breakdown?: BreakdownRow[];
  comparison?: ComparisonTrendPoint[];
  periodALabel?: string;
  periodBLabel?: string;
  radar?: AnalyticsAskRadarPoint[];
}

export interface AnalyticsAskReport {
  summary: string;
  highlights: string[];
  recommendations: string[];
}

export interface AdminBusinessAnalyticsAskResult {
  interpretedQuery: string;
  aiPowered: boolean;
  geminiConfigured: boolean;
  period: { start: string; end: string; label: string };
  comparisonPeriod?: { label: string };
  summary: AnalyticsSummary;
  comparisonSummary?: AnalyticsSummary;
  deltas?: {
    totalVisits: number;
    totalRevenue: number;
    conversionRate: number;
    uniqueCustomers: number;
    avgTransaction: number;
    fieldSalesCount: number;
  };
  charts: AnalyticsAskChart[];
  report: AnalyticsAskReport;
}
