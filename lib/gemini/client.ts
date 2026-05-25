import { randomUUID } from "crypto";
import type { AnalyticsData, InsightCard, InsightContext } from "@/types";

export function buildInsightPrompt(
  data: AnalyticsData,
  context: InsightContext,
): string {
  const kpis = data.kpis;

  return `You are an analytics assistant for a jewelry store chain.
Analyze the following aggregated, anonymized data and return 3-5 actionable insights as JSON array.
Each insight must have: id (uuid), title, body, severity (info|success|warning|alert), optional metric {label, value, delta}, optional action {label, href}.

Context: ${context}
KPIs: ${JSON.stringify(kpis)}
Visits by day: ${JSON.stringify(data.visitsByDay)}
Source breakdown: ${JSON.stringify(data.sourceBreakdown)}
Purchase status: ${JSON.stringify(data.purchaseStatusBreakdown)}
No-purchase reasons: ${JSON.stringify(data.noPurchaseReasons)}
${data.storeRankings ? `Store rankings: ${JSON.stringify(data.storeRankings)}` : ""}

Return ONLY valid JSON array, no markdown.`;
}

export function parseInsightResponse(text: string): InsightCard[] {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    const parsed: unknown = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isInsightCard).map(normalizeInsight);
  } catch {
    return [];
  }
}

function normalizeInsight(insight: InsightCard): InsightCard {
  return {
    ...insight,
    id: insight.id || randomUUID(),
  };
}

function isInsightCard(value: unknown): value is InsightCard {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const severity = item.severity;
  return (
    typeof item.title === "string" &&
    typeof item.body === "string" &&
    typeof severity === "string" &&
    ["info", "success", "warning", "alert"].includes(severity)
  );
}

export function getFallbackInsights(
  data: AnalyticsData,
  context: InsightContext,
): InsightCard[] {
  const insights: InsightCard[] = [];

  if ("openFollowUps" in data.kpis && data.kpis.openFollowUps > 0) {
    insights.push({
      id: "fallback-follow-ups",
      title: "Follow-up pipeline needs attention",
      body: `There are ${data.kpis.openFollowUps} open follow-ups. Prioritize overdue contacts to recover potential revenue.`,
      severity: "warning",
      metric: {
        label: "Open follow-ups",
        value: String(data.kpis.openFollowUps),
      },
    });
  }

  if ("conversionRate" in data.kpis) {
    const rate = data.kpis.conversionRate;
    insights.push({
      id: "fallback-conversion",
      title: rate >= 30 ? "Strong conversion performance" : "Conversion rate below target",
      body:
        rate >= 30
          ? `Conversion rate is ${rate.toFixed(1)}%, indicating effective floor engagement.`
          : `Conversion rate is ${rate.toFixed(1)}%. Review no-purchase reasons and staff coaching opportunities.`,
      severity: rate >= 30 ? "success" : "info",
      metric: { label: "Conversion rate", value: `${rate.toFixed(1)}%` },
    });
  }

  if (context === "admin" && data.storeRankings && data.storeRankings.length > 1) {
    const top = data.storeRankings[0];
    const bottom = data.storeRankings[data.storeRankings.length - 1];
    insights.push({
      id: "fallback-store-gap",
      title: "Cross-store performance gap detected",
      body: `${top.storeName} leads with ₹${top.revenue.toLocaleString("en-IN")} revenue while ${bottom.storeName} trails at ₹${bottom.revenue.toLocaleString("en-IN")}. Share best practices from top performers.`,
      severity: "info",
    });
  }

  const topReason = data.noPurchaseReasons[0];
  if (topReason) {
    insights.push({
      id: "fallback-no-purchase",
      title: "Top no-purchase objection",
      body: `"${topReason.reason}" is the most common reason customers leave without buying (${topReason.count} visits). Address this in staff training.`,
      severity: "info",
    });
  }

  return insights.slice(0, 4);
}

export async function generateInsights(
  data: AnalyticsData,
  context: InsightContext,
): Promise<InsightCard[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getFallbackInsights(data, context);
  }

  const prompt = buildInsightPrompt(data, context);

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseInsightResponse(text);

    if (parsed.length === 0) {
      return getFallbackInsights(data, context);
    }

    return parsed;
  } catch {
    return getFallbackInsights(data, context);
  }
}
