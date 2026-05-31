"use client";

import {
  IndianRupee,
  Repeat,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { KPICard } from "@/components/analytics/KPICard";
import { DashboardCollapsibleSection } from "@/components/shared/DashboardCollapsibleSection";
import { formatCurrency } from "@/lib/utils/formatters";
import type { Content } from "@/content/en";
import type { StoreKPIDeltas, StoreKPIs } from "@/types";

type BusinessOverviewCopy = Content["store"]["businessOverview"];
type KpiLabels = Content["store"]["kpis"];

interface StoreBusinessOverviewSectionProps {
  copy: BusinessOverviewCopy;
  kpiLabels: KpiLabels;
  periodLabel: string;
  deltaPeriod: string;
  kpis: StoreKPIs | null;
  deltas?: StoreKPIDeltas;
  isLoading: boolean;
}

export function StoreBusinessOverviewSection({
  copy,
  kpiLabels,
  periodLabel,
  deltaPeriod,
  kpis,
  deltas,
  isLoading,
}: StoreBusinessOverviewSectionProps) {
  const title = (copy?.title ?? "Business Overview ({period})").replace(
    "{period}",
    periodLabel,
  );

  return (
    <DashboardCollapsibleSection
      title={title}
      subtitle={
        copy?.subtitle ??
        "Store-wide visits, revenue, conversion, and customer metrics at a glance."
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 [&>*]:min-w-0">
          <KPICard
            label={kpiLabels.totalVisits}
            value={kpis?.totalVisits ?? 0}
            delta={deltas?.totalVisits}
            deltaPeriod={deltaPeriod}
            icon={<Users className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <KPICard
            label={kpiLabels.totalRevenue}
            value={kpis ? formatCurrency(kpis.totalRevenue) : formatCurrency(0)}
            delta={deltas?.totalRevenue}
            deltaPeriod={deltaPeriod}
            icon={<IndianRupee className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <KPICard
            label={kpiLabels.conversionRate}
            value={kpis?.conversionRate ?? 0}
            unit="%"
            delta={deltas?.conversionRate}
            deltaPeriod={deltaPeriod}
            icon={<TrendingUp className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <KPICard
            label={kpiLabels.avgTransaction}
            value={kpis ? formatCurrency(kpis.avgTransaction) : formatCurrency(0)}
            delta={deltas?.avgTransaction}
            deltaPeriod={deltaPeriod}
            icon={<ShoppingBag className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <KPICard
            label={kpiLabels.newCustomers}
            value={kpis?.newCustomers ?? 0}
            delta={deltas?.newCustomers}
            deltaPeriod={deltaPeriod}
            icon={<UserPlus className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <KPICard
            label={kpiLabels.repeatCustomers}
            value={kpis?.repeatCustomers ?? 0}
            delta={deltas?.repeatCustomers}
            deltaPeriod={deltaPeriod}
            icon={<Repeat className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <KPICard
            label={kpiLabels.openFollowUps}
            value={kpis?.openFollowUps ?? 0}
            icon={<Users className="h-4 w-4" />}
            isLoading={isLoading}
            className="col-span-2 lg:col-span-1"
          />
      </div>
    </DashboardCollapsibleSection>
  );
}
