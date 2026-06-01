"use client";

import { useMemo, useState } from "react";
import {
  useAdminBusinessAnalytics,
  useAdminBusinessAnalyticsFilters,
} from "@/hooks/useAdminBusinessAnalytics";
import { KPICard } from "@/components/analytics/KPICard";
import { SalesLineChart } from "@/components/charts/lazy";
import { AnalyticsBreakdownChart } from "@/components/admin/analytics/AnalyticsBreakdownChart";
import { AnalyticsComparisonTrendChart } from "@/components/admin/analytics/AnalyticsComparisonTrendChart";
import { AnalyticsAppliedFiltersBar } from "@/components/admin/analytics/AnalyticsAppliedFiltersBar";
import { AnalyticsPeriodPicker } from "@/components/admin/analytics/AnalyticsPeriodPicker";
import { AnalyticsToggledFilter } from "@/components/admin/analytics/AnalyticsToggledFilter";
import {
  buildActiveFiltersQuery,
  createEmptyFilterDraft,
  type AnalyticsFilterDraft,
  type AnalyticsFilterKey,
} from "@/lib/analytics/admin-business-filters";
import {
  buildAnalyticsDateQuery,
  DEFAULT_PERIOD_SELECTION,
  type AnalyticsPeriodSelection,
} from "@/lib/query/admin-business-analytics-period";
import { EmptyState } from "@/components/shared/EmptyState";
import { QueryLoadState } from "@/components/shared/QueryLoadState";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/formatters";
import type { AdminBusinessAnalyticsQuery } from "@/lib/validations/admin-business-analytics.schema";
import type {
  AdminBusinessAnalytics,
  AdminBusinessAnalyticsFilterOptions,
} from "@/types/admin-business-analytics";
import type { Content } from "@/content/en";
import { BarChart3, IndianRupee, TrendingUp, Users } from "lucide-react";

type AdminAnalyticsContent = Content["admin"]["analytics"];

interface AdminBusinessAnalyticsProps {
  copy: AdminAnalyticsContent;
  common: Content["common"];
  errors: Content["errors"];
  initialFilters?: AdminBusinessAnalyticsFilterOptions;
  initialData?: AdminBusinessAnalytics;
  initialParams?: AdminBusinessAnalyticsQuery;
}

const PERIOD_PRESETS = [
  { value: "today", label: "Today" },
  { value: "week", label: "7d" },
  { value: "month", label: "30d" },
  { value: "last3months", label: "90d" },
  { value: "last6months", label: "6mo" },
] as const satisfies Array<{
  value: NonNullable<AdminBusinessAnalyticsQuery["period"]>;
  label: string;
}>;

function pickDefaultFilterValue(
  key: AnalyticsFilterKey,
  options: AdminBusinessAnalyticsFilterOptions,
): string {
  switch (key) {
    case "storeId":
      return options.stores[0]?.id ?? "";
    case "staffId":
      return options.staff[0]?.id ?? "";
    case "segment":
      return "NEW";
    case "valueTier":
      return "HIGH";
    case "area":
      return "NA";
    case "schemeEnrolled":
      return "true";
    default: {
      const optionLists: Record<string, { value: string }[]> = {
        customerType: options.customerTypes,
        intentTier: options.intentTiers,
        purchaseStatus: options.purchaseStatuses,
        visitType: options.visitTypes,
        sourceChannel: options.sourceChannels,
        gender: options.genders,
        ageGroup: options.ageGroups,
        budgetRange: options.budgetRanges,
        productCategory: options.productCategories,
        schemeProduct: options.schemeProducts,
        enrollmentOutcome: options.enrollmentOutcomes,
      };
      return optionLists[key]?.[0]?.value ?? "";
    }
  }
}

export function AdminBusinessAnalytics({
  copy,
  common,
  errors,
  initialFilters,
  initialData,
  initialParams,
}: AdminBusinessAnalyticsProps) {
  const [periodSelection, setPeriodSelection] = useState<AnalyticsPeriodSelection>(
    DEFAULT_PERIOD_SELECTION,
  );
  const [filterDraft, setFilterDraft] = useState<AnalyticsFilterDraft>(createEmptyFilterDraft);
  const [appliedFilterDraft, setAppliedFilterDraft] =
    useState<AnalyticsFilterDraft>(createEmptyFilterDraft);

  const queryParams = useMemo<AdminBusinessAnalyticsQuery>(() => {
    const filterQuery = buildActiveFiltersQuery(appliedFilterDraft);
    return {
      ...buildAnalyticsDateQuery(periodSelection),
      ...filterQuery,
      segment: filterQuery.segment ?? "ALL",
      valueTier: filterQuery.valueTier ?? "ALL",
      activeFilters: filterQuery.activeFilters ?? [],
    };
  }, [periodSelection, appliedFilterDraft]);

  const { data: filterOptions } = useAdminBusinessAnalyticsFilters();
  const options = filterOptions ?? initialFilters;

  const useInitial =
    initialData &&
    initialParams &&
    JSON.stringify(queryParams) === JSON.stringify(initialParams);

  const { data, isLoading, isError, refetch } = useAdminBusinessAnalytics(queryParams);
  const analytics = useInitial ? initialData : data;

  function setFilterEnabled(key: AnalyticsFilterKey, enabled: boolean) {
    if (!options) return;
    setFilterDraft((current) => {
      const next: AnalyticsFilterDraft = {
        enabled: { ...current.enabled, [key]: enabled },
        values: {
          ...current.values,
          [key]:
            enabled && !current.values[key]
              ? pickDefaultFilterValue(key, options)
              : current.values[key],
        },
      };
      if (key === "storeId" && !enabled) {
        next.enabled.staffId = false;
        next.values.staffId = "";
      }
      return next;
    });
  }

  function setFilterValue(key: AnalyticsFilterKey, value: string) {
    setFilterDraft((current) => {
      const next: AnalyticsFilterDraft = {
        ...current,
        values: { ...current.values, [key]: value },
      };
      if (key === "storeId") {
        next.values.staffId = "";
      }
      return next;
    });
  }

  function applyDimensionFilters() {
    setAppliedFilterDraft(filterDraft);
  }

  function resetFilters() {
    setPeriodSelection(DEFAULT_PERIOD_SELECTION);
    const empty = createEmptyFilterDraft();
    setFilterDraft(empty);
    setAppliedFilterDraft(empty);
  }

  const staffOptionsForStore = useMemo(() => {
    if (!options) return [];
    const storeId = filterDraft.values.storeId;
    if (!filterDraft.enabled.storeId || !storeId) return options.staff;
    return options.staff.filter((member) => member.storeId === storeId);
  }, [filterDraft.enabled.storeId, filterDraft.values.storeId, options]);

  const areaOptions = useMemo(
    () => [
      { value: "NA", label: copy.naLabel },
      ...(options?.areas ?? []).map((area) => ({ value: area, label: area })),
    ],
    [copy.naLabel, options?.areas],
  );

  const segmentOptions = useMemo(
    () => options?.segments.filter((item) => item.value !== "ALL") ?? [],
    [options?.segments],
  );

  const valueTierOptions = useMemo(
    () => options?.valueTiers.filter((item) => item.value !== "ALL") ?? [],
    [options?.valueTiers],
  );

  const schemeEnrolledOptions = useMemo(
    () => [
      { value: "true", label: copy.yesLabel },
      { value: "false", label: copy.noLabel },
      { value: "NA", label: copy.naLabel },
    ],
    [copy.naLabel, copy.noLabel, copy.yesLabel],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">{copy.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{copy.subtitle}</p>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <aside className="w-full shrink-0 space-y-4 xl:sticky xl:top-4 xl:w-80">
          <div className="rounded-card border border-border bg-surface-card p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-text-primary">
                {copy.filtersTitle}
              </h2>
              <Button type="button" size="sm" variant="ghost" onClick={resetFilters}>
                {copy.resetFilters}
              </Button>
            </div>

            <div className="space-y-4">
              <AnalyticsPeriodPicker
                copy={{
                  dateRangeLabel: copy.dateRangeLabel,
                  tabPresets: copy.tabPresets,
                  tabRange: copy.tabRange,
                  tabDay: copy.tabDay,
                  tabMonth: copy.tabMonth,
                  tabCompare: copy.tabCompare,
                  periodALabel: copy.periodALabel,
                  periodBLabel: copy.periodBLabel,
                  applyLabel: copy.applyLabel,
                  confirmLabel: copy.confirmLabel,
                  rangeSelectionHint: copy.rangeSelectionHint,
                  daySelectionHint: copy.daySelectionHint,
                  customSectionLabel: copy.customSectionLabel,
                }}
                selection={periodSelection}
                onSelectionChange={setPeriodSelection}
                presets={PERIOD_PRESETS}
              />

              {options && (
                <div className="space-y-3">
                  <p className="text-xs text-text-muted">{copy.filterToggleHint}</p>
                  <AnalyticsToggledFilter
                    id="store-filter"
                    label={copy.storeLabel}
                    enabled={filterDraft.enabled.storeId}
                    value={filterDraft.values.storeId}
                    placeholder={copy.filterPlaceholder}
                    options={options.stores.map((store) => ({
                      value: store.id,
                      label: store.name,
                    }))}
                    onEnabledChange={(enabled) => setFilterEnabled("storeId", enabled)}
                    onValueChange={(value) => setFilterValue("storeId", value)}
                  />
                  <AnalyticsToggledFilter
                    id="rso-filter"
                    label={copy.rsoLabel}
                    enabled={filterDraft.enabled.staffId}
                    value={filterDraft.values.staffId}
                    placeholder={copy.filterPlaceholder}
                    options={staffOptionsForStore.map((member) => ({
                      value: member.id,
                      label: member.name,
                    }))}
                    onEnabledChange={(enabled) => setFilterEnabled("staffId", enabled)}
                    onValueChange={(value) => setFilterValue("staffId", value)}
                  />
                  <AnalyticsToggledFilter
                    id="segment-filter"
                    label={copy.segmentLabel}
                    enabled={filterDraft.enabled.segment}
                    value={filterDraft.values.segment}
                    placeholder={copy.filterPlaceholder}
                    options={segmentOptions}
                    onEnabledChange={(enabled) => setFilterEnabled("segment", enabled)}
                    onValueChange={(value) => setFilterValue("segment", value)}
                  />
                  <AnalyticsToggledFilter
                    id="value-tier-filter"
                    label={copy.valueTierLabel}
                    enabled={filterDraft.enabled.valueTier}
                    value={filterDraft.values.valueTier}
                    placeholder={copy.filterPlaceholder}
                    options={valueTierOptions}
                    onEnabledChange={(enabled) => setFilterEnabled("valueTier", enabled)}
                    onValueChange={(value) => setFilterValue("valueTier", value)}
                  />
                  <AnalyticsToggledFilter
                    id="customer-type-filter"
                    label={copy.customerTypeLabel}
                    enabled={filterDraft.enabled.customerType}
                    value={filterDraft.values.customerType}
                    placeholder={copy.filterPlaceholder}
                    options={options.customerTypes}
                    onEnabledChange={(enabled) => setFilterEnabled("customerType", enabled)}
                    onValueChange={(value) => setFilterValue("customerType", value)}
                  />
                  <AnalyticsToggledFilter
                    id="intent-filter"
                    label={copy.intentLabel}
                    enabled={filterDraft.enabled.intentTier}
                    value={filterDraft.values.intentTier}
                    placeholder={copy.filterPlaceholder}
                    options={options.intentTiers}
                    onEnabledChange={(enabled) => setFilterEnabled("intentTier", enabled)}
                    onValueChange={(value) => setFilterValue("intentTier", value)}
                  />
                  <AnalyticsToggledFilter
                    id="purchase-filter"
                    label={copy.purchaseStatusLabel}
                    enabled={filterDraft.enabled.purchaseStatus}
                    value={filterDraft.values.purchaseStatus}
                    placeholder={copy.filterPlaceholder}
                    options={options.purchaseStatuses}
                    onEnabledChange={(enabled) => setFilterEnabled("purchaseStatus", enabled)}
                    onValueChange={(value) => setFilterValue("purchaseStatus", value)}
                  />
                  <AnalyticsToggledFilter
                    id="product-filter"
                    label={copy.productLabel}
                    enabled={filterDraft.enabled.productCategory}
                    value={filterDraft.values.productCategory}
                    placeholder={copy.filterPlaceholder}
                    options={options.productCategories}
                    onEnabledChange={(enabled) => setFilterEnabled("productCategory", enabled)}
                    onValueChange={(value) => setFilterValue("productCategory", value)}
                  />
                  <AnalyticsToggledFilter
                    id="budget-filter"
                    label={copy.priceLabel}
                    enabled={filterDraft.enabled.budgetRange}
                    value={filterDraft.values.budgetRange}
                    placeholder={copy.filterPlaceholder}
                    options={options.budgetRanges}
                    onEnabledChange={(enabled) => setFilterEnabled("budgetRange", enabled)}
                    onValueChange={(value) => setFilterValue("budgetRange", value)}
                  />
                  <AnalyticsToggledFilter
                    id="scheme-filter"
                    label={copy.schemeLabel}
                    enabled={filterDraft.enabled.schemeProduct}
                    value={filterDraft.values.schemeProduct}
                    placeholder={copy.filterPlaceholder}
                    options={options.schemeProducts}
                    onEnabledChange={(enabled) => setFilterEnabled("schemeProduct", enabled)}
                    onValueChange={(value) => setFilterValue("schemeProduct", value)}
                  />
                  <AnalyticsToggledFilter
                    id="enrollment-filter"
                    label={copy.enrollmentLabel}
                    enabled={filterDraft.enabled.enrollmentOutcome}
                    value={filterDraft.values.enrollmentOutcome}
                    placeholder={copy.filterPlaceholder}
                    options={options.enrollmentOutcomes}
                    onEnabledChange={(enabled) =>
                      setFilterEnabled("enrollmentOutcome", enabled)
                    }
                    onValueChange={(value) => setFilterValue("enrollmentOutcome", value)}
                  />
                  <AnalyticsToggledFilter
                    id="source-filter"
                    label={copy.sourceLabel}
                    enabled={filterDraft.enabled.sourceChannel}
                    value={filterDraft.values.sourceChannel}
                    placeholder={copy.filterPlaceholder}
                    options={options.sourceChannels}
                    onEnabledChange={(enabled) => setFilterEnabled("sourceChannel", enabled)}
                    onValueChange={(value) => setFilterValue("sourceChannel", value)}
                  />
                  <AnalyticsToggledFilter
                    id="gender-filter"
                    label={copy.genderLabel}
                    enabled={filterDraft.enabled.gender}
                    value={filterDraft.values.gender}
                    placeholder={copy.filterPlaceholder}
                    options={options.genders}
                    onEnabledChange={(enabled) => setFilterEnabled("gender", enabled)}
                    onValueChange={(value) => setFilterValue("gender", value)}
                  />
                  <AnalyticsToggledFilter
                    id="age-filter"
                    label={copy.ageLabel}
                    enabled={filterDraft.enabled.ageGroup}
                    value={filterDraft.values.ageGroup}
                    placeholder={copy.filterPlaceholder}
                    options={options.ageGroups}
                    onEnabledChange={(enabled) => setFilterEnabled("ageGroup", enabled)}
                    onValueChange={(value) => setFilterValue("ageGroup", value)}
                  />
                  <AnalyticsToggledFilter
                    id="area-filter"
                    label={copy.locationLabel}
                    enabled={filterDraft.enabled.area}
                    value={filterDraft.values.area}
                    placeholder={copy.filterPlaceholder}
                    options={areaOptions}
                    onEnabledChange={(enabled) => setFilterEnabled("area", enabled)}
                    onValueChange={(value) => setFilterValue("area", value)}
                  />
                  <AnalyticsToggledFilter
                    id="scheme-enrolled-filter"
                    label={copy.schemeEnrolledLabel}
                    enabled={filterDraft.enabled.schemeEnrolled}
                    value={filterDraft.values.schemeEnrolled}
                    placeholder={copy.filterPlaceholder}
                    options={schemeEnrolledOptions}
                    onEnabledChange={(enabled) => setFilterEnabled("schemeEnrolled", enabled)}
                    onValueChange={(value) => setFilterValue("schemeEnrolled", value)}
                  />
                  <AnalyticsToggledFilter
                    id="visit-type-filter"
                    label={copy.visitTypeLabel}
                    enabled={filterDraft.enabled.visitType}
                    value={filterDraft.values.visitType}
                    placeholder={copy.filterPlaceholder}
                    options={options.visitTypes}
                    onEnabledChange={(enabled) => setFilterEnabled("visitType", enabled)}
                    onValueChange={(value) => setFilterValue("visitType", value)}
                  />
                  <Button type="button" className="w-full" onClick={applyDimensionFilters}>
                    {copy.applyFiltersLabel}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <QueryLoadState
            isLoading={isLoading && !analytics}
            isError={isError}
            loadingLabel={common.loading}
            errorLabel={errors.generic}
            retryLabel={errors.tryAgain}
            onRetry={() => void refetch()}
          >
            {!analytics ? (
              <EmptyState message={copy.emptyData} />
            ) : (
              <>
                <AnalyticsAppliedFiltersBar
                  title={copy.appliedFiltersTitle}
                  emptyLabel={copy.noAppliedFiltersLabel}
                  periodLabel={analytics.period.label}
                  filters={analytics.appliedFilters}
                />

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 [&>*]:min-w-0">
                  <KPICard
                    label={copy.kpis.visits}
                    value={analytics.summary.totalVisits}
                    icon={<Users className="h-4 w-4" />}
                    delta={analytics.comparison?.deltas.totalVisits}
                    deltaPeriod={
                      analytics.comparison
                        ? `${copy.vsLabel} ${analytics.comparison.period.label}`
                        : undefined
                    }
                  />
                  <KPICard
                    label={copy.kpis.revenue}
                    value={formatCurrency(analytics.summary.totalRevenue)}
                    icon={<IndianRupee className="h-4 w-4" />}
                    delta={analytics.comparison?.deltas.totalRevenue}
                    deltaPeriod={
                      analytics.comparison
                        ? `${copy.vsLabel} ${analytics.comparison.period.label}`
                        : undefined
                    }
                  />
                  <KPICard
                    label={copy.kpis.conversion}
                    value={analytics.summary.conversionRate}
                    unit="%"
                    icon={<TrendingUp className="h-4 w-4" />}
                    delta={analytics.comparison?.deltas.conversionRate}
                    deltaPeriod={
                      analytics.comparison
                        ? `${copy.vsLabel} ${analytics.comparison.period.label}`
                        : undefined
                    }
                  />
                  <KPICard
                    label={copy.kpis.avgTransaction}
                    value={formatCurrency(analytics.summary.avgTransaction)}
                    icon={<BarChart3 className="h-4 w-4" />}
                    delta={analytics.comparison?.deltas.avgTransaction}
                    deltaPeriod={
                      analytics.comparison
                        ? `${copy.vsLabel} ${analytics.comparison.period.label}`
                        : undefined
                    }
                  />
                  <KPICard
                    label={copy.kpis.fieldSales}
                    value={analytics.summary.fieldSalesCount}
                    delta={analytics.comparison?.deltas.fieldSalesCount}
                    deltaPeriod={
                      analytics.comparison
                        ? `${copy.vsLabel} ${analytics.comparison.period.label}`
                        : undefined
                    }
                  />
                  <KPICard
                    label={copy.kpis.uniqueCustomers}
                    value={analytics.summary.uniqueCustomers}
                    delta={analytics.comparison?.deltas.uniqueCustomers}
                    deltaPeriod={
                      analytics.comparison
                        ? `${copy.vsLabel} ${analytics.comparison.period.label}`
                        : undefined
                    }
                  />
                </div>

                {analytics.comparison ? (
                  <AnalyticsComparisonTrendChart
                    title={copy.comparisonTrend}
                    periodALabel={analytics.period.label}
                    periodBLabel={analytics.comparison.period.label}
                    revenueLabel={copy.kpis.revenue}
                    data={analytics.comparison.comparisonTrends}
                  />
                ) : (
                  <SalesLineChart
                    title={copy.charts.trend}
                    data={analytics.trends}
                    revenueLabel={copy.kpis.revenue}
                  />
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <AnalyticsBreakdownChart
                    title={copy.charts.customerType}
                    data={analytics.breakdowns.customerType}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.valueTier}
                    data={analytics.breakdowns.valueTier}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.intent}
                    data={analytics.breakdowns.intentTier}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.purchaseStatus}
                    data={analytics.breakdowns.purchaseStatus}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.source}
                    data={analytics.breakdowns.sourceChannel}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.productsExplored}
                    data={analytics.breakdowns.productsExplored}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.productsPurchased}
                    data={analytics.breakdowns.productsPurchased}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.schemeProduct}
                    data={analytics.breakdowns.schemeProduct}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.enrollment}
                    data={analytics.breakdowns.enrollmentOutcome}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.gender}
                    data={analytics.breakdowns.gender}
                    emptyMessage={copy.emptyBreakdown}
                  />
                  <AnalyticsBreakdownChart
                    title={copy.charts.location}
                    data={analytics.breakdowns.area}
                    emptyMessage={copy.emptyBreakdown}
                  />
                </div>

                <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
                  <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
                    {copy.charts.rsoPerformance}
                  </h3>
                  {analytics.breakdowns.staff.length === 0 ? (
                    <p className="text-sm text-text-muted">{copy.emptyBreakdown}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="border-b border-border text-text-secondary">
                          <tr>
                            <th className="px-3 py-2 font-medium">{copy.rsoLabel}</th>
                            <th className="px-3 py-2 font-medium">{copy.kpis.visits}</th>
                            <th className="px-3 py-2 font-medium">{copy.kpis.revenue}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.breakdowns.staff.map((row) => (
                            <tr key={row.staffId} className="border-b border-border last:border-0">
                              <td className="px-3 py-2 font-medium text-text-primary">
                                {row.label}
                              </td>
                              <td className="px-3 py-2">{row.visits}</td>
                              <td className="px-3 py-2">{formatCurrency(row.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="rounded-card border border-dashed border-border bg-surface-secondary/50 p-4 text-sm text-text-secondary">
                  <p className="font-medium text-text-primary">{copy.ai.title}</p>
                  <p className="mt-1">{copy.ai.comingSoon}</p>
                </div>
              </>
            )}
          </QueryLoadState>
        </main>
      </div>
    </div>
  );
}
