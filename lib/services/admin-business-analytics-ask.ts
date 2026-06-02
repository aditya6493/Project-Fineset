import { buildAskCharts } from "@/lib/analytics/ask-charts";
import {
  generateReportWithGemini,
  isGeminiConfigured,
  parseIntentWithGemini,
} from "@/lib/analytics/ask-gemini";
import { describeParsedIntent, parseAnalyticsAskIntent } from "@/lib/analytics/ask-intent-parser";
import { buildRuleBasedAskReport } from "@/lib/analytics/ask-report";
import type { AnalyticsAskBody } from "@/lib/validations/admin-business-analytics-ask.schema";
import type { ParsedAnalyticsAskIntent } from "@/lib/validations/admin-business-analytics-ask.schema";
import type { AdminBusinessAnalyticsQuery } from "@/lib/validations/admin-business-analytics.schema";
import { getAdminBusinessAnalytics } from "@/lib/services/admin-business-analytics";
import type { AdminBusinessAnalyticsAskResult } from "@/types/admin-business-analytics-ask";

function intentToAnalyticsQuery(intent: ParsedAnalyticsAskIntent): AdminBusinessAnalyticsQuery {
  const query: AdminBusinessAnalyticsQuery = {
    dateMode: intent.dateMode,
    activeFilters: intent.activeFilters ?? [],
    segment: intent.segment ?? "ALL",
    valueTier: intent.valueTier ?? "ALL",
  };

  if (intent.dateMode === "preset") {
    query.period = intent.period ?? "month";
  } else if (intent.period) {
    query.period = intent.period;
  }
  if (intent.month) query.month = intent.month;
  if (intent.year) query.year = intent.year;
  if (intent.compareAMonth) query.compareAMonth = intent.compareAMonth;
  if (intent.compareAYear) query.compareAYear = intent.compareAYear;
  if (intent.compareBMonth) query.compareBMonth = intent.compareBMonth;
  if (intent.compareBYear) query.compareBYear = intent.compareBYear;
  if (intent.customerType) query.customerType = intent.customerType;
  if (intent.productCategory) query.productCategory = intent.productCategory;
  if (intent.area) query.area = intent.area;

  return query;
}

export async function askAdminBusinessAnalytics(
  body: AnalyticsAskBody,
): Promise<AdminBusinessAnalyticsAskResult> {
  const geminiConfigured = isGeminiConfigured();

  let intent =
    geminiConfigured ? await parseIntentWithGemini(body.prompt) : null;
  let aiPowered = Boolean(intent);

  if (!intent) {
    intent = parseAnalyticsAskIntent(body.prompt);
    aiPowered = false;
  }

  const interpretedQuery = describeParsedIntent(intent);
  const query = intentToAnalyticsQuery(intent);
  if (body.storeId) {
    query.storeId = body.storeId;
    query.activeFilters = [...new Set([...(query.activeFilters ?? []), "storeId"])];
  }
  const analytics = await getAdminBusinessAnalytics(query);
  const dimension = intent.breakdownDimension ?? "customerType";

  const charts = buildAskCharts(intent, analytics);

  let report =
    geminiConfigured
      ? await generateReportWithGemini(body.prompt, analytics, interpretedQuery)
      : null;

  if (!report) {
    report = buildRuleBasedAskReport(analytics, dimension);
  } else {
    aiPowered = true;
  }

  return {
    interpretedQuery,
    aiPowered,
    geminiConfigured,
    period: analytics.period,
    comparisonPeriod: analytics.comparison?.period,
    summary: analytics.summary,
    comparisonSummary: analytics.comparison?.summary,
    deltas: analytics.comparison?.deltas,
    charts,
    report,
  };
}
