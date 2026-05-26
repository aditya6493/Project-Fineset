"use client";

import { Award, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { QueryLoadState } from "@/components/shared/QueryLoadState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Content } from "@/content/en";
import type { RsoPerformanceRow, StoreRsoPerformance } from "@/types";

type StoreRsoContent = Content["store"]["rsoPerformance"];
type RsoColumns = StoreRsoContent["columns"];

interface RsoPerformanceViewProps {
  title: string;
  copy: StoreRsoContent;
  data?: StoreRsoPerformance;
  isLoading: boolean;
  isError?: boolean;
  errorLabel?: string;
  retryLabel?: string;
  onRetry?: () => void;
  emptyMessage: string;
}

export function RsoPerformanceView({
  title,
  copy,
  data,
  isLoading,
  isError,
  errorLabel,
  retryLabel,
  onRetry,
  emptyMessage,
}: RsoPerformanceViewProps) {
  return (
    <QueryLoadState
      isLoading={isLoading}
      isError={isError}
      errorLabel={errorLabel}
      retryLabel={retryLabel}
      onRetry={onRetry}
      skeletonCount={3}
    >
      {!data || data.rows.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="space-y-4">
          <section className="rounded-card border border-border bg-surface-card shadow-card">
            <div className="border-b border-border px-4 py-3 sm:px-6">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {title}
              </h2>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {data.rows.map((row) => (
                <RsoPerformanceMobileCard
                  key={row.staffId}
                  row={row}
                  columns={copy.columns}
                />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="border-b border-border bg-surface-secondary">
                  <tr>
                    {[
                      copy.columns.rsoName,
                      copy.columns.customersAttended,
                      copy.columns.purchased,
                      copy.columns.notPurchased,
                      copy.columns.schemesEnrolled,
                      copy.columns.growth,
                      copy.columns.revenue,
                    ].map((label) => (
                      <th
                        key={label}
                        className="whitespace-nowrap px-4 py-3 font-medium text-text-secondary"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr
                      key={row.staffId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">
                        {row.staffName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{row.customersAttended}</td>
                      <td className="whitespace-nowrap px-4 py-3">{row.purchased}</td>
                      <td className="whitespace-nowrap px-4 py-3">{row.notPurchased}</td>
                      <td className="whitespace-nowrap px-4 py-3">{row.schemesEnrolled}</td>
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
                      <td className="whitespace-nowrap px-4 py-3">{row.revenueLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <HighlightCard
              title={copy.topPerformer.title}
              name={data.topPerformer?.staffName}
              primary={data.topPerformer?.salesLabel}
              secondary={data.topPerformer?.revenueLabel}
              emptyLabel={copy.emptyHighlight}
              icon={Award}
              accent="gold"
            />
            <HighlightCard
              title={copy.mostImproved.title}
              name={data.mostImproved?.staffName}
              primary={data.mostImproved?.growthLabel}
              secondary={data.mostImproved?.salesProgressLabel}
              emptyLabel={copy.emptyHighlight}
              icon={TrendingUp}
              accent="success"
            />
          </div>
        </div>
      )}
    </QueryLoadState>
  );
}

function RsoPerformanceMobileCard({
  row,
  columns,
}: {
  row: RsoPerformanceRow;
  columns: RsoColumns;
}) {
  const metrics = [
    { label: columns.customersAttended, value: String(row.customersAttended) },
    { label: columns.purchased, value: String(row.purchased) },
    { label: columns.notPurchased, value: String(row.notPurchased) },
    { label: columns.schemesEnrolled, value: String(row.schemesEnrolled) },
    { label: columns.growth, value: row.growthLabel, tone: row.growthTone },
    { label: columns.revenue, value: row.revenueLabel },
  ];

  return (
    <article className="rounded-card border border-border bg-surface-secondary/40 p-4">
      <h3 className="font-display text-base font-semibold text-text-primary">
        {row.staffName}
      </h3>
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
    <Card className="overflow-hidden">
      <CardHeader className="space-y-0 pb-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-sans text-sm font-medium text-text-secondary">
            {title}
          </CardTitle>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-card",
              iconWrapClass,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {name ? (
          <div className="space-y-2">
            <p className="font-display text-2xl font-bold text-text-primary">{name}</p>
            {primary && (
              <p className="text-sm font-medium text-text-secondary">{primary}</p>
            )}
            {secondary && <p className="text-sm text-text-muted">{secondary}</p>}
          </div>
        ) : (
          <div className="rounded-input border border-dashed border-border bg-surface-secondary/60 px-4 py-8 text-center text-sm text-text-muted">
            {emptyLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
