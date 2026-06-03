"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  CalendarRange,
  Clock3,
  Crown,
  Gem,
  LayoutGrid,
  MapPin,
  Radar,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { AnalyticsBreakdownChart } from "@/components/admin/analytics/AnalyticsBreakdownChart";
import { AnalyticsComparisonTrendChart } from "@/components/admin/analytics/AnalyticsComparisonTrendChart";
import { AnalyticsPieChart } from "@/components/admin/analytics/AnalyticsPieChart";
import { AnalyticsRadarChart } from "@/components/admin/analytics/AnalyticsRadarChart";
import { KPICard } from "@/components/analytics/KPICard";
import { SalesLineChart } from "@/components/charts/lazy";
import { QueryLoadState } from "@/components/shared/QueryLoadState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAdminBusinessAnalyticsAsk } from "@/hooks/useAdminBusinessAnalyticsAsk";
import { buildAnalyticsAskExamples } from "@/lib/analytics/ask-example-prompts";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/formatters";
import type { AdminBusinessAnalyticsAskResult } from "@/types/admin-business-analytics-ask";
import type { Content } from "@/content/en";
import { ApiError } from "@/types";

type AskCopy = Content["admin"]["analytics"]["ask"];

const EXAMPLE_ICONS = {
  compare: ArrowLeftRight,
  "compare-visits": BarChart3,
  trend: TrendingUp,
  week: CalendarRange,
  segment: Users,
  breakdown: LayoutGrid,
  conversion: Target,
  source: Share2,
  area: MapPin,
  vip: Crown,
  scheme: Gem,
  retained: UserCheck,
  overview: Radar,
} as const;

interface AnalyticsAskPanelProps {
  copy: AskCopy;
  common: Content["common"];
  errors: Content["errors"];
  kpis: Content["admin"]["analytics"]["kpis"];
  emptyBreakdown: string;
  storeId?: string;
}

export function AnalyticsAskPanel({
  copy,
  common,
  errors,
  kpis,
  emptyBreakdown,
  storeId,
}: AnalyticsAskPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [activeLeftTab, setActiveLeftTab] = useState<"recommendations" | "history">(
    "recommendations",
  );
  const [historyPrompts, setHistoryPrompts] = useState<string[]>([]);
  const [result, setResult] = useState<AdminBusinessAnalyticsAskResult | null>(null);

  const { mutate, isPending, isError, error, reset } = useAdminBusinessAnalyticsAsk();

  const examples = useMemo(
    () => buildAnalyticsAskExamples(copy.examplePrompts),
    [copy.examplePrompts],
  );

  const errorLabel =
    error instanceof ApiError && error.body.message
      ? error.body.message
      : errors.generic;

  function runAsk(example?: string) {
    const text = (example ?? prompt).trim();
    if (text.length < 3) return;

    setActivePrompt(text);
    setHistoryPrompts((current) => [text, ...current.filter((item) => item !== text)].slice(0, 25));
    setResult(null);
    mutate(
      { prompt: text, storeId },
      {
        onSuccess: (data) => {
          setResult(data);
          if (example) setPrompt(example);
        },
      },
    );
  }

  const showEmptyChat = !activePrompt && !result && !isPending;

  const promptComposer = (
    <div className="border-t border-border pt-5">
      <label className="sr-only" htmlFor="analytics-ask-prompt">
        {copy.promptLabel}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Textarea
          id="analytics-ask-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={copy.promptPlaceholder}
          rows={3}
          className="min-h-[4.5rem] flex-1 resize-none bg-surface-primary focus-visible:bg-surface-primary sm:min-h-[3.5rem]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              runAsk();
            }
          }}
        />
        <Button
          type="button"
          className="shrink-0 sm:min-w-[7rem]"
          disabled={prompt.trim().length < 3 || isPending}
          onClick={() => runAsk()}
        >
          {copy.analyzeButton}
        </Button>
      </div>
    </div>
  );

  const panelCard =
    "rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-5";
  const chatPanelCard =
    "overflow-hidden rounded-card border border-border bg-surface-card shadow-card";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] lg:items-start">
      <div className="min-h-0 lg:flex lg:flex-col">
        <aside
          className={cn(
            panelCard,
            "flex min-h-0 flex-col",
            "lg:sticky lg:top-[calc(var(--portal-header-offset)+var(--portal-sticky-gap,0.75rem))] lg:z-[5] lg:max-h-[calc(100svh-var(--portal-header-offset)-var(--portal-sticky-gap,0.75rem)-var(--portal-sticky-gap,0.75rem))] lg:overscroll-none lg:self-start",
          )}
          aria-labelledby="analytics-ask-examples"
        >
          <Tabs
            value={activeLeftTab}
            onValueChange={(value) =>
              setActiveLeftTab(value === "history" ? "history" : "recommendations")
            }
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList
              aria-labelledby="analytics-ask-examples"
              className="grid h-10 w-full grid-cols-2"
            >
              <TabsTrigger
                value="recommendations"
                className="min-w-0 overflow-hidden px-2 text-xs sm:px-3 sm:text-sm"
                title={copy.examplesLabel}
              >
                <span className="truncate sm:hidden">Recommendations</span>
                <span className="hidden truncate sm:inline">{copy.examplesLabel}</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="min-w-0 overflow-hidden px-2 text-xs sm:px-3 sm:text-sm"
                title={copy.historyTabLabel}
              >
                {copy.historyTabLabel}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="recommendations"
              className="mt-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-none lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden"
              data-recommendations-scroll
            >
              <ul className="flex flex-col gap-2">
                {examples.map((example) => {
                  const Icon = EXAMPLE_ICONS[example.id as keyof typeof EXAMPLE_ICONS] ?? LayoutGrid;
                  const isActive = activePrompt === example.prompt;
                  return (
                    <li key={example.id}>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => runAsk(example.prompt)}
                        className={cn(
                          "group flex w-full gap-3 rounded-card border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/45 disabled:cursor-not-allowed disabled:opacity-60",
                          isActive
                            ? "border-brand-gold/50 bg-brand-gold/5 shadow-sm"
                            : "border-border bg-surface-card shadow-sm hover:border-brand-gold/35 hover:bg-surface-secondary/40",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isActive
                              ? "bg-brand-gold/20 text-brand-gold"
                              : "bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold/15",
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          {example.hint ? (
                            <span className="block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                              {example.hint}
                            </span>
                          ) : null}
                          <span className="mt-0.5 block text-sm leading-snug text-text-secondary transition-colors group-hover:text-text-primary">
                            {example.prompt}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </TabsContent>

            <TabsContent
              value="history"
              className="mt-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-none lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden"
            >
              {historyPrompts.length === 0 ? (
                <p className="rounded-card border border-border bg-surface-secondary/30 px-3.5 py-3 text-sm text-text-muted">
                  {copy.historyEmpty}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {historyPrompts.map((question) => {
                    const isActive = activePrompt === question;
                    return (
                      <li key={question}>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => runAsk(question)}
                          className={cn(
                            "group flex w-full gap-3 rounded-card border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/45 disabled:cursor-not-allowed disabled:opacity-60",
                            isActive
                              ? "border-brand-gold/50 bg-brand-gold/5 shadow-sm"
                              : "border-border bg-surface-card shadow-sm hover:border-brand-gold/35 hover:bg-surface-secondary/40",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                              isActive
                                ? "bg-brand-gold/20 text-brand-gold"
                                : "bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold/15",
                            )}
                          >
                            <Clock3 className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1 text-sm leading-snug text-text-secondary transition-colors group-hover:text-text-primary">
                            {question}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      <section
        className={cn(chatPanelCard, "min-w-0 w-full lg:self-start")}
        aria-label="Analytics chat"
      >
        <div className="border-b border-border bg-surface-card px-4 py-3 sm:px-5">
          <p className="text-sm leading-relaxed text-text-muted">{copy.chatPanelIntro}</p>
        </div>
        <div className="space-y-5 p-4 sm:p-5">
          {showEmptyChat ? (
            <div className="flex flex-col items-center justify-center px-4 py-5 text-center">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </span>
                <p className="font-medium text-text-primary">{copy.chatEmptyTitle}</p>
                <p className="mt-1 max-w-sm text-sm text-text-muted">{copy.chatEmptyDescription}</p>
              </div>
          ) : (
            <div className="space-y-5">
              {activePrompt ? (
                  <div className="flex justify-end">
                    <div className="max-w-[92%] rounded-2xl rounded-br-md border border-border bg-surface-secondary/35 px-4 py-2.5 text-sm text-text-primary">
                      {activePrompt}
                    </div>
                  </div>
                ) : null}

                <QueryLoadState
                  isLoading={isPending}
                  isError={isError}
                  loadingLabel={common.loading}
                  errorLabel={errorLabel}
                  retryLabel={errors.tryAgain}
                  onRetry={() => {
                    reset();
                    runAsk();
                  }}
                >
                  {result && (
                    <div className="space-y-6">
                      <div className="rounded-card border border-border bg-surface-card p-4 text-sm shadow-sm">
                        <p className="font-medium text-text-primary">{copy.interpretedLabel}</p>
                        <p className="mt-1 text-text-secondary">{result.interpretedQuery}</p>
                        <p className="mt-2 text-xs text-text-muted">
                          {result.aiPowered ? copy.aiPowered : copy.rulePowered}
                          {result.geminiConfigured ? "" : ` · ${copy.geminiNotConfigured}`}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 [&>*]:min-w-0">
                        <KPICard label={kpis.visits} value={result.summary.totalVisits} />
                        <KPICard
                          label={kpis.revenue}
                          value={formatCurrency(result.summary.totalRevenue)}
                        />
                        <KPICard
                          label={kpis.conversion}
                          value={result.summary.conversionRate}
                          unit="%"
                        />
                      </div>

                      <div className="grid gap-6 xl:grid-cols-2">
                        {result.charts.map((chart, index) => {
                          const key = `${chart.type}-${index}`;
                          switch (chart.type) {
                            case "line":
                              return (
                                <SalesLineChart
                                  key={key}
                                  title={chart.title}
                                  data={chart.trend ?? []}
                                  revenueLabel={kpis.revenue}
                                />
                              );
                            case "bar":
                              return (
                                <AnalyticsBreakdownChart
                                  key={key}
                                  title={chart.title}
                                  data={chart.breakdown ?? []}
                                  emptyMessage={emptyBreakdown}
                                />
                              );
                            case "pie":
                              return (
                                <AnalyticsPieChart
                                  key={key}
                                  title={chart.title}
                                  description={chart.description}
                                  data={chart.breakdown ?? []}
                                  emptyMessage={emptyBreakdown}
                                />
                              );
                            case "comparison":
                              return chart.comparison &&
                                chart.periodALabel &&
                                chart.periodBLabel ? (
                                <AnalyticsComparisonTrendChart
                                  key={key}
                                  title={chart.title}
                                  periodALabel={chart.periodALabel}
                                  periodBLabel={chart.periodBLabel}
                                  revenueLabel={kpis.revenue}
                                  data={chart.comparison}
                                />
                              ) : null;
                            case "radar":
                              return (
                                <AnalyticsRadarChart
                                  key={key}
                                  title={chart.title}
                                  description={chart.description}
                                  data={chart.radar ?? []}
                                  emptyMessage={emptyBreakdown}
                                />
                              );
                            default:
                              return null;
                          }
                        })}
                      </div>

                      <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
                        <h3 className="font-display text-lg font-semibold text-text-primary">
                          {copy.reportTitle}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                          {result.report.summary}
                        </p>
                        {result.report.highlights.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-text-primary">
                              {copy.highlightsTitle}
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                              {result.report.highlights.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.report.recommendations.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-text-primary">
                              {copy.recommendationsTitle}
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                              {result.report.recommendations.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </QueryLoadState>
            </div>
          )}

          {promptComposer}
        </div>
      </section>
    </div>
  );
}
