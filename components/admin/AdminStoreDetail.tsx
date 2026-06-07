"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  IndianRupee,
  MapPin,
  Repeat,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import {
  useAdminStoreDetailAnalytics,
} from "@/hooks/useAnalytics";
import { KPICard } from "@/components/analytics/KPICard";
import { BreakdownBarChart, SalesLineChart } from "@/components/charts/lazy";
import { PeriodSwitcher, type PeriodValue } from "@/components/shared/PeriodSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_DASHBOARD_PATH } from "@/lib/auth/routes";
import { formatCurrency } from "@/lib/utils/formatters";
import { getStoreCategoryLabel } from "@/lib/utils/store-category";
import type { Content } from "@/content/en";
import type { StoreKPIDeltas, StoreKPIs } from "@/types";
import { AdminRsoPerformanceSection } from "./AdminRsoPerformanceSection";

type AdminContent = Content["admin"];
type StoreContent = Content["store"];

interface AdminStoreDetailProps {
  storeId: string;
  admin: AdminContent;
  storeCopy: StoreContent;
  initialDetail?: import("@/types").StoreDetailAnalytics;
  initialParams?: import("@/types").GetAnalyticsParams;
}

export function AdminStoreDetail({
  storeId,
  admin,
  storeCopy,
  initialDetail,
  initialParams,
}: AdminStoreDetailProps) {
  const [period, setPeriod] = useState<PeriodValue>("week");
  const { data, isLoading, isError } = useAdminStoreDetailAnalytics(
    storeId,
    { period },
    { initialData: initialDetail, initialParams },
  );

  const periodOptions = [
    { value: "today" as const, label: admin.period.today },
    { value: "week" as const, label: admin.period.week },
    { value: "month" as const, label: admin.period.month },
    { value: "last3months" as const, label: admin.period.last3months },
    { value: "last6months" as const, label: admin.period.last6months },
  ];

  if (isError) {
    return (
      <div className="space-y-4">
        <BackLink label={admin.storeDetail.backToPortfolio} />
        <EmptyState message={admin.storeDetail.notFound} />
      </div>
    );
  }

  const kpis = data?.kpis ?? null;
  const deltas = data?.kpiDeltas as StoreKPIDeltas | undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <BackLink label={admin.storeDetail.backToPortfolio} />
          {isLoading ? (
            <div aria-live="polite" aria-busy="true" className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-brand-gold">
                  {getStoreCategoryLabel(data!.store.category)}
                </p>
                <h1 className="font-display text-2xl font-bold text-text-primary">
                  {data!.store.name}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                  <MapPin className="h-4 w-4" />
                  {data!.store.city}, {data!.store.state}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/admin/dashboard/calls?storeId=${storeId}`}
                    prefetch={false}
                  >
                    {admin.storeDetail.viewCalls}
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/admin/dashboard/field-sales?storeId=${storeId}`}
                    prefetch={false}
                  >
                    {admin.storeDetail.viewFieldSales}
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/admin/dashboard/staff?storeId=${storeId}`}
                    prefetch={false}
                  >
                    {admin.storeDetail.viewStaff}
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
        <PeriodSwitcher options={periodOptions} value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 [&>*]:min-w-0">
        <StoreKpiGrid
          kpis={kpis}
          deltas={deltas}
          labels={storeCopy.kpis}
          isLoading={isLoading}
          deltaPeriod={admin.deltaPeriod}
        />
      </div>

      <AdminRsoPerformanceSection
        storeId={storeId}
        copy={storeCopy.rsoPerformance}
        periodLabels={storeCopy.period}
        period={period}
        emptyMessage={storeCopy.rsoPerformance.empty}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SalesLineChart
          title={admin.storeDetail.revenueTrend}
          data={data?.visitsByDay ?? []}
          revenueLabel={storeCopy.kpis.totalRevenue}
        />
        <BreakdownBarChart
          title={admin.storeDetail.sourceBreakdown}
          data={(data?.sourceBreakdown ?? []).map((item) => ({
            label: formatSourceChannel(item.channel),
            count: item.count,
          }))}
          emptyMessage={admin.storeDetail.noBreakdownData}
        />
        <BreakdownBarChart
          title={admin.storeDetail.purchaseStatusBreakdown}
          data={(data?.purchaseStatusBreakdown ?? []).map((item) => ({
            label: formatPurchaseStatus(item.status),
            count: item.count,
          }))}
          emptyMessage={admin.storeDetail.noBreakdownData}
        />
        <BreakdownBarChart
          title={admin.storeDetail.noPurchaseReasons}
          data={(data?.noPurchaseReasons ?? []).map((item) => ({
            label: formatNoPurchaseReason(item.reason),
            count: item.count,
          }))}
          emptyMessage={admin.storeDetail.noBreakdownData}
        />
      </div>
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <Link
      href={ADMIN_DASHBOARD_PATH}
      prefetch={false}
      className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-brand-gold"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

interface StoreKpiGridProps {
  kpis: StoreKPIs | null;
  deltas?: StoreKPIDeltas;
  labels: StoreContent["kpis"];
  isLoading: boolean;
  deltaPeriod: string;
}

function StoreKpiGrid({
  kpis,
  deltas,
  labels,
  isLoading,
  deltaPeriod,
}: StoreKpiGridProps) {
  return (
    <>
      <KPICard
        label={labels.totalVisits}
        value={kpis?.totalVisits ?? 0}
        delta={deltas?.totalVisits}
        deltaPeriod={deltaPeriod}
        icon={<Users className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.totalRevenue}
        value={kpis ? formatCurrency(kpis.totalRevenue) : formatCurrency(0)}
        delta={deltas?.totalRevenue}
        deltaPeriod={deltaPeriod}
        icon={<IndianRupee className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.conversionRate}
        value={kpis?.conversionRate ?? 0}
        unit="%"
        delta={deltas?.conversionRate}
        deltaPeriod={deltaPeriod}
        icon={<TrendingUp className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.avgTransaction}
        value={kpis ? formatCurrency(kpis.avgTransaction) : formatCurrency(0)}
        delta={deltas?.avgTransaction}
        deltaPeriod={deltaPeriod}
        icon={<ShoppingBag className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.newCustomers}
        value={kpis?.newCustomers ?? 0}
        delta={deltas?.newCustomers}
        deltaPeriod={deltaPeriod}
        icon={<UserPlus className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.repeatCustomers}
        value={kpis?.repeatCustomers ?? 0}
        delta={deltas?.repeatCustomers}
        deltaPeriod={deltaPeriod}
        icon={<Repeat className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <KPICard
        label={labels.openFollowUps}
        value={kpis?.openFollowUps ?? 0}
        icon={<Users className="h-4 w-4" />}
        isLoading={isLoading}
        className="col-span-2 lg:col-span-1"
      />
    </>
  );
}

function formatSourceChannel(channel: string): string {
  return channel
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatPurchaseStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatNoPurchaseReason(reason: string): string {
  return reason
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
