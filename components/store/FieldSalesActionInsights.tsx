"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { PhoneCall, Target } from "lucide-react";
import { SectionTitle } from "@/components/shared/PageTitle";
import { KPICard } from "@/components/analytics/KPICard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  activityTypeFromLabel,
} from "@/lib/utils/field-analytics-links";
import {
  CHART_CARD_CLASS,
  CHART_CARD_CONTENT_CLASS,
  CHART_CARD_HEADER_CLASS,
  CHART_GRID_CLASS,
  truncateChartLabel,
  VERTICAL_BAR_CHART_MARGIN,
} from "@/lib/utils/chart-layout";
import { formatPercent } from "@/lib/utils/formatters";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";
import { useChartCategoryAxisWidth } from "@/hooks/useChartCategoryAxisWidth";
import type { Content } from "@/content/en";
import type { StoreFieldSaleAnalytics, StoreFieldSaleBreakdownRow } from "@/types";

type FieldSalesOverviewCopy = Content["store"]["fieldSalesOverview"];
type InsightsCopy = FieldSalesOverviewCopy["insights"];

const COACHING_DECLINE_LABELS = new Set([
  "Budget",
  "Trust concerns",
  "Competitor scheme",
  "Not interested",
  "Needs time",
]);

const enrollmentRateChartConfig = {
  enrollmentRatePercent: { label: "Enrollment rate", color: "var(--brand-gold)" },
  total: { label: "Visits", color: "var(--text-muted)" },
} as const;

const declineChartConfig = {
  total: { label: "Declines", color: "var(--status-error)" },
} as const;

interface FieldSalesActionInsightsProps {
  copy: InsightsCopy;
  notesCopy: FieldSalesOverviewCopy["notes"];
  data: StoreFieldSaleAnalytics;
  deltaPeriod: string;
  onActivityClick: (label: string) => void;
}

export function FieldSalesActionInsights({
  copy,
  notesCopy,
  data,
  deltaPeriod,
  onActivityClick,
}: FieldSalesActionInsightsProps) {
  const { summary, deltas, byActivityType, byDeclineReason, byIntentTier, notesInsights } =
    data;

  const activityByRate = [...byActivityType]
    .filter((row) => row.total > 0)
    .sort((a, b) => b.enrollmentRatePercent - a.enrollmentRatePercent);

  const coachingDeclines = byDeclineReason.filter((row) =>
    COACHING_DECLINE_LABELS.has(row.label),
  );

  const intentByRate = [...byIntentTier]
    .filter((row) => row.total > 0)
    .sort((a, b) => {
      const order = ["Hot intent", "Warm intent", "Cold intent", "Browsing"];
      return order.indexOf(a.label) - order.indexOf(b.label);
    });

  const objectionThemes = notesInsights.themes.filter((theme) =>
    ["budget", "trust", "competitor", "interest", "scheme", "timing"].includes(theme.key),
  );

  return (
    <section className="space-y-4">
      <div>
        <SectionTitle title={copy.sectionTitle} />
        <p className="mt-1 text-sm text-text-muted">{copy.sectionSubtitle}</p>
      </div>

      <div className={CHART_GRID_CLASS}>
        <EnrollmentRateBreakdownChart
          title={copy.enrollmentByActivity}
          hint={copy.enrollmentByActivityHint}
          rows={activityByRate}
          clickable
          onBarClick={onActivityClick}
        />

        <FollowUpConversionPanel
          copy={copy}
          summary={summary}
          delta={deltas.followUpConversionPercent}
          deltaPeriod={deltaPeriod}
        />

        <EnrollmentRateBreakdownChart
          title={copy.intentTier}
          hint={copy.intentTierHint}
          rows={intentByRate}
        />

        <DeclineReasonsChart
          title={copy.declineReasons}
          hint={copy.declineReasonsHint}
          rows={coachingDeclines}
          emptyMessage={copy.noDeclineData}
        />
      </div>

      <NotesThemesPanel
        copy={copy}
        notesCopy={notesCopy}
        themes={objectionThemes.length > 0 ? objectionThemes : notesInsights.themes}
        aiSummary={notesInsights.aiSummary}
        aiSummaryAvailable={notesInsights.aiSummaryAvailable}
        emptyMessage={copy.noNotesThemes}
      />
    </section>
  );
}

function EnrollmentRateBreakdownChart({
  title,
  hint,
  rows,
  clickable = false,
  onBarClick,
}: {
  title: string;
  hint: string;
  rows: StoreFieldSaleBreakdownRow[];
  clickable?: boolean;
  onBarClick?: (label: string) => void;
}) {
  const categoryWidth = useChartCategoryAxisWidth(118, 76);
  if (rows.length === 0) return null;

  function handleClick(row: StoreFieldSaleBreakdownRow | undefined) {
    if (!clickable || !row?.label || !onBarClick) return;
    if (activityTypeFromLabel(row.label)) {
      onBarClick(row.label);
    }
  }

  return (
    <Card className={CHART_CARD_CLASS}>
      <CardHeader className={CHART_CARD_HEADER_CLASS}>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      <CardContent className={CHART_CARD_CONTENT_CLASS}>
        <ChartContainer
          config={enrollmentRateChartConfig}
          className={`h-[240px] w-full ${clickable ? "cursor-pointer" : ""}`}
        >
          <BarChart data={rows} layout="vertical" margin={VERTICAL_BAR_CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              fontSize={10}
              fontFamily={NUMERIC_FONT_FAMILY}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={categoryWidth}
              fontSize={10}
              tickLine={false}
              tickFormatter={(value: string) => truncateChartLabel(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    const row = item.payload as StoreFieldSaleBreakdownRow;
                    return [
                      `${value}% (${row.enrolled}/${row.total} enrolled)`,
                      "Enrollment rate",
                    ];
                  }}
                />
              }
            />
            <Bar
              dataKey="enrollmentRatePercent"
              fill="var(--color-enrollmentRatePercent)"
              radius={[0, 4, 4, 0]}
              onClick={(barData) =>
                handleClick(
                  (barData as { payload?: StoreFieldSaleBreakdownRow }).payload,
                )
              }
            />
          </BarChart>
        </ChartContainer>
        <ul className="mt-3 space-y-1 text-xs text-text-muted">
          {rows.slice(0, 4).map((row) => (
            <li key={row.label} className="flex justify-between gap-2">
              <span className="truncate">{row.label}</span>
              <span className="shrink-0 font-numeric">
                {formatPercent(row.enrollmentRatePercent)} · {row.enrolled}/{row.total}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DeclineReasonsChart({
  title,
  hint,
  rows,
  emptyMessage,
}: {
  title: string;
  hint: string;
  rows: StoreFieldSaleBreakdownRow[];
  emptyMessage: string;
}) {
  const categoryWidth = useChartCategoryAxisWidth(118, 76);

  return (
    <Card className={CHART_CARD_CLASS}>
      <CardHeader className={CHART_CARD_HEADER_CLASS}>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      <CardContent className={CHART_CARD_CONTENT_CLASS}>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">{emptyMessage}</p>
        ) : (
          <ChartContainer config={declineChartConfig} className="h-[240px] w-full">
            <BarChart data={rows} layout="vertical" margin={VERTICAL_BAR_CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={10} fontFamily={NUMERIC_FONT_FAMILY} />
              <YAxis
                type="category"
                dataKey="label"
                width={categoryWidth}
                fontSize={10}
                tickLine={false}
                tickFormatter={(value: string) => truncateChartLabel(value)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="total"
                fill="var(--color-total)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function FollowUpConversionPanel({
  copy,
  summary,
  delta,
  deltaPeriod,
}: {
  copy: InsightsCopy;
  summary: StoreFieldSaleAnalytics["summary"];
  delta: number;
  deltaPeriod: string;
}) {
  const convertedLabel = copy.followUpConverted
    .replace("{converted}", String(summary.convertedFollowUps))
    .replace("{required}", String(summary.followUpRequired));

  return (
    <Card className={CHART_CARD_CLASS}>
      <CardHeader className={CHART_CARD_HEADER_CLASS}>
        <CardTitle className="text-base">{copy.followUpConversion}</CardTitle>
        <CardDescription>{copy.followUpConversionHint}</CardDescription>
      </CardHeader>
      <CardContent className={`${CHART_CARD_CONTENT_CLASS} space-y-4`}>
        <KPICard
          label={copy.followUpConversion}
          value={summary.followUpConversionPercent}
          unit="%"
          delta={delta}
          deltaPeriod={deltaPeriod}
          icon={<PhoneCall className="h-4 w-4" />}
        />
        <KPICard
          label="Converted"
          value={summary.convertedFollowUps}
          icon={<Target className="h-4 w-4" />}
        />
        <div className="border-t border-border pt-4 text-xs text-text-muted">
          <p>{convertedLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function NotesThemesPanel({
  copy,
  notesCopy,
  themes,
  aiSummary,
  aiSummaryAvailable,
  emptyMessage,
}: {
  copy: InsightsCopy;
  notesCopy: FieldSalesOverviewCopy["notes"];
  themes: StoreFieldSaleAnalytics["notesInsights"]["themes"];
  aiSummary: string | null;
  aiSummaryAvailable: boolean;
  emptyMessage: string;
}) {
  return (
    <Card className={CHART_CARD_CLASS}>
      <CardHeader className={CHART_CARD_HEADER_CLASS}>
        <CardTitle className="text-base">{copy.notesThemes}</CardTitle>
        <CardDescription>{copy.notesThemesHint}</CardDescription>
      </CardHeader>
      <CardContent className={`${CHART_CARD_CONTENT_CLASS} space-y-4`}>
        {aiSummary ? (
          <div className="rounded-lg border border-border bg-surface-card p-4">
            <p className="text-xs font-medium text-text-muted">{notesCopy.aiSummary}</p>
            <p className="mt-1 text-sm text-text-primary">{aiSummary}</p>
          </div>
        ) : null}

        {themes.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <li
                key={theme.key}
                className="rounded-full border border-border bg-surface-card px-3 py-1.5 text-xs"
              >
                <span className="font-medium text-text-primary">{theme.label}</span>
                <span className="ml-1.5 font-numeric text-text-muted">({theme.count})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">
            {aiSummaryAvailable ? emptyMessage : notesCopy.aiUnavailable}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
