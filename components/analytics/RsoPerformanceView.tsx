"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  TrendingUp,
} from "lucide-react";
import { ExportButton } from "@/components/shared/ExportButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DashboardCollapsibleSection } from "@/components/shared/DashboardCollapsibleSection";
import { QueryLoadState } from "@/components/shared/QueryLoadState";
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
import { cn } from "@/lib/utils";
import {
  exportRsoStaffBreakdownCsv,
  rsoConversionPercent,
} from "@/lib/utils/rso-staff-export";
import {
  CHART_CARD_CLASS,
  CHART_CARD_CONTENT_CLASS,
  CHART_CARD_HEADER_CLASS,
  CHART_GRID_CLASS,
  truncateChartLabel,
  VERTICAL_BAR_CHART_MARGIN,
} from "@/lib/utils/chart-layout";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";
import { useChartCategoryAxisWidth } from "@/hooks/useChartCategoryAxisWidth";
import type { Content } from "@/content/en";
import type { RsoPerformanceRow, StoreRsoPerformance } from "@/types";

type StoreRsoContent = Content["store"]["rsoPerformance"];

const staffRevenueChartConfig = {
  revenue: { label: "Revenue", color: "var(--brand-gold)" },
} as const;

const staffConversionChartConfig = {
  conversionRatePercent: { label: "Conversion", color: "var(--status-success)" },
} as const;

interface RsoPerformanceViewProps {
  title: string;
  subtitle?: string;
  copy: StoreRsoContent;
  data?: StoreRsoPerformance;
  isLoading: boolean;
  isError?: boolean;
  errorLabel?: string;
  retryLabel?: string;
  onRetry?: () => void;
  emptyMessage: string;
  periodLabel?: string;
  collapsible?: boolean;
}

export function RsoPerformanceView({
  title,
  subtitle,
  copy,
  data,
  isLoading,
  isError,
  errorLabel,
  retryLabel,
  onRetry,
  emptyMessage,
  periodLabel = "",
  collapsible = false,
}: RsoPerformanceViewProps) {
  const body = (
    <QueryLoadState
      isLoading={isLoading}
      isError={isError}
      errorLabel={errorLabel ?? copy.error}
      retryLabel={retryLabel ?? copy.retry}
      onRetry={onRetry}
      skeletonCount={4}
    >
      {!data || data.rows.every((row) => row.customersAttended === 0) ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <RsoPerformanceContent copy={copy} data={data} periodLabel={periodLabel} />
      )}
    </QueryLoadState>
  );

  if (collapsible) {
    return (
      <DashboardCollapsibleSection title={title} subtitle={subtitle}>
        {body}
      </DashboardCollapsibleSection>
    );
  }

  return (
    <section className="rounded-card border border-border bg-surface-card">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      <div className="min-w-0 overflow-x-hidden p-4 sm:p-6">{body}</div>
    </section>
  );
}

function RsoPerformanceContent({
  copy,
  data,
  periodLabel,
}: {
  copy: StoreRsoContent;
  data: StoreRsoPerformance;
  periodLabel: string;
}) {
  const activeRows = data.rows.filter((row) => row.customersAttended > 0);
  const tableRows = activeRows.length > 0 ? activeRows : data.rows;

  return (
    <div className="space-y-6">
      <RsoHighlights copy={copy} data={data} />
      {activeRows.length > 0 && (
        <div className={CHART_GRID_CLASS}>
          <StaffRevenueChart copy={copy} rows={activeRows} />
          <StaffConversionChart copy={copy} rows={activeRows} />
        </div>
      )}
      <RsoStaffTable copy={copy} rows={tableRows} periodLabel={periodLabel} />
    </div>
  );
}

function RsoHighlights({
  copy,
  data,
}: {
  copy: StoreRsoContent;
  data: StoreRsoPerformance;
}) {
  if (!data.topPerformer && !data.mostImproved) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <HighlightCard
        title={copy.highlights.topPerformer.title}
        name={data.topPerformer?.staffName}
        primary={data.topPerformer?.salesLabel}
        secondary={data.topPerformer?.revenueLabel}
        emptyLabel={copy.emptyHighlight}
        icon={Award}
        accent="gold"
      />
      <HighlightCard
        title={copy.highlights.mostImproved.title}
        name={data.mostImproved?.staffName}
        primary={data.mostImproved?.growthLabel}
        secondary={data.mostImproved?.salesProgressLabel}
        emptyLabel={copy.emptyHighlight}
        icon={TrendingUp}
        accent="success"
      />
    </div>
  );
}

function StaffRevenueChart({
  copy,
  rows,
}: {
  copy: StoreRsoContent;
  rows: RsoPerformanceRow[];
}) {
  const categoryWidth = useChartCategoryAxisWidth(110, 72);
  const chartData = [...rows]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <Card className={CHART_CARD_CLASS}>
      <CardHeader className={CHART_CARD_HEADER_CLASS}>
        <CardTitle className="text-base">{copy.charts.staffRevenue}</CardTitle>
        <CardDescription>{copy.charts.staffRevenueHint}</CardDescription>
      </CardHeader>
      <CardContent className={CHART_CARD_CONTENT_CLASS}>
        <ChartContainer config={staffRevenueChartConfig} className="h-[260px] w-full">
          <BarChart data={chartData} layout="vertical" margin={VERTICAL_BAR_CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" fontSize={10} fontFamily={NUMERIC_FONT_FAMILY} />
            <YAxis
              type="category"
              dataKey="staffName"
              width={categoryWidth}
              fontSize={10}
              tickLine={false}
              tickFormatter={(value: string) => truncateChartLabel(value, 12)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function StaffConversionChart({
  copy,
  rows,
}: {
  copy: StoreRsoContent;
  rows: RsoPerformanceRow[];
}) {
  const categoryWidth = useChartCategoryAxisWidth(110, 72);
  const chartData = [...rows]
    .map((row) => ({
      staffName: row.staffName,
      conversionRatePercent: rsoConversionPercent(row),
    }))
    .sort((a, b) => b.conversionRatePercent - a.conversionRatePercent)
    .slice(0, 10);

  return (
    <Card className={CHART_CARD_CLASS}>
      <CardHeader className={CHART_CARD_HEADER_CLASS}>
        <CardTitle className="text-base">{copy.charts.staffConversion}</CardTitle>
        <CardDescription>{copy.charts.staffConversionHint}</CardDescription>
      </CardHeader>
      <CardContent className={CHART_CARD_CONTENT_CLASS}>
        <ChartContainer config={staffConversionChartConfig} className="h-[260px] w-full">
          <BarChart data={chartData} layout="vertical" margin={VERTICAL_BAR_CHART_MARGIN}>
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
              dataKey="staffName"
              width={categoryWidth}
              fontSize={10}
              tickLine={false}
              tickFormatter={(value: string) => truncateChartLabel(value, 12)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="conversionRatePercent"
              fill="var(--color-conversionRatePercent)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function RsoStaffTable({
  copy,
  rows,
  periodLabel,
}: {
  copy: StoreRsoContent;
  rows: RsoPerformanceRow[];
  periodLabel: string;
}) {
  const columns = copy.table;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex flex-col gap-3 border-b border-border bg-surface-secondary/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-base font-semibold text-text-primary">
          {columns.title}
        </h3>
        <ExportButton
          label={copy.exportCsv}
          onExport={() =>
            exportRsoStaffBreakdownCsv({
              rows,
              headers: columns,
              periodLabel,
            })
          }
          disabled={rows.length === 0}
        />
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {rows.map((row) => (
          <RsoPerformanceMobileCard key={row.staffId} row={row} columns={copy.columns} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1020px] text-left text-sm">
          <thead className="border-b border-border bg-surface-secondary text-text-secondary">
            <tr>
              {[
                columns.staff,
                columns.customersAttended,
                columns.purchased,
                columns.notPurchased,
                columns.schemesEnrolled,
                columns.dataEntryScore,
                columns.growth,
                columns.revenue,
              ].map((label) => (
                <th key={label} className="whitespace-nowrap px-4 py-3 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.staffId} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">
                  {row.staffName}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-numeric">
                  {row.customersAttended}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-numeric text-status-success">
                  {row.purchased}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-numeric">{row.notPurchased}</td>
                <td className="whitespace-nowrap px-4 py-3 font-numeric">{row.schemesEnrolled}</td>
                <td className="whitespace-nowrap px-4 py-3 font-numeric">
                  {row.dataEntryScoreLabel}
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap px-4 py-3 font-medium",
                    row.growthTone === "positive" && "text-status-success",
                    row.growthTone === "negative" && "text-status-error",
                    row.growthTone === "neutral" && "text-text-secondary",
                  )}
                >
                  {row.growthLabel}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-numeric">{row.revenueLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RsoPerformanceMobileCard({
  row,
  columns,
}: {
  row: RsoPerformanceRow;
  columns: StoreRsoContent["columns"];
}) {
  const metrics = [
    { label: columns.customersAttended, value: String(row.customersAttended) },
    { label: columns.purchased, value: String(row.purchased) },
    { label: columns.notPurchased, value: String(row.notPurchased) },
    { label: columns.schemesEnrolled, value: String(row.schemesEnrolled) },
    { label: columns.dataEntryScore, value: row.dataEntryScoreLabel },
    { label: columns.growth, value: row.growthLabel, tone: row.growthTone },
    { label: columns.revenue, value: row.revenueLabel },
  ];

  return (
    <article className="rounded-lg border border-border bg-surface-secondary/40 p-4">
      <h3 className="font-display text-base font-semibold text-text-primary">{row.staffName}</h3>
      <dl className="mt-3 space-y-2.5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-start justify-between gap-3 border-b border-border/70 pb-2.5 last:border-0 last:pb-0"
          >
            <dt className="text-xs text-text-secondary">{metric.label}</dt>
            <dd
              className={cn(
                "text-right text-sm font-medium text-text-primary",
                metric.tone === "positive" && "text-status-success",
                metric.tone === "negative" && "text-status-error",
                metric.tone === "neutral" && "text-text-secondary",
              )}
            >
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function HighlightCard({
  title,
  name,
  primary,
  secondary,
  emptyLabel,
  icon: Icon,
  accent,
}: {
  title: string;
  name?: string;
  primary?: string;
  secondary?: string;
  emptyLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "gold" | "success";
}) {
  const iconWrapClass =
    accent === "gold"
      ? "bg-brand-gold/10 text-brand-gold"
      : "bg-status-success/10 text-status-success";

  return (
    <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            iconWrapClass,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
      <div className="mt-3">
        {name ? (
          <div className="space-y-1">
            <p className="font-display text-xl font-bold text-text-primary">{name}</p>
            {primary && <p className="text-sm font-medium text-text-secondary">{primary}</p>}
            {secondary && <p className="text-sm text-text-muted">{secondary}</p>}
          </div>
        ) : (
          <p className="text-sm text-text-muted">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}
