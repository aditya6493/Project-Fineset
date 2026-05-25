"use client";

import { useAdminFollowUpOverview } from "@/hooks/useAdminFollowUps";
import { KPICard } from "@/components/analytics/KPICard";
import { EmptyState } from "@/components/shared/EmptyState";
import { maskPhone, formatDate } from "@/lib/utils/formatters";
import type { Content } from "@/content/en";

type AdminContent = Content["admin"];

interface FollowUpOverviewProps {
  admin: AdminContent;
  emptyMessage: string;
}

export function FollowUpOverview({ admin, emptyMessage }: FollowUpOverviewProps) {
  const { data, isLoading } = useAdminFollowUpOverview();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-text-primary">
        {admin.followUp.title}
      </h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KPICard
          label={admin.followUp.summary.open}
          value={data?.summary.open ?? 0}
          isLoading={isLoading}
        />
        <KPICard
          label={admin.followUp.summary.overdue}
          value={data?.summary.overdue ?? 0}
          isLoading={isLoading}
          className="border-status-warning/30"
        />
        <KPICard
          label={admin.followUp.summary.converted}
          value={data?.summary.converted ?? 0}
          isLoading={isLoading}
        />
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          {admin.followUp.overdueAlert}
        </h2>

        {isLoading ? (
          <div className="h-48 animate-pulse rounded-card bg-surface-secondary" />
        ) : !data || data.overdueItems.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <div className="overflow-x-auto rounded-card border border-border bg-surface-card shadow-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border bg-surface-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">
                    {admin.followUp.columns.store}
                  </th>
                  <th className="px-4 py-3 font-medium text-text-secondary">
                    {admin.followUp.columns.customer}
                  </th>
                  <th className="px-4 py-3 font-medium text-text-secondary">
                    {admin.followUp.columns.phone}
                  </th>
                  <th className="px-4 py-3 font-medium text-text-secondary">
                    {admin.followUp.columns.assignedStaff}
                  </th>
                  <th className="px-4 py-3 font-medium text-text-secondary">
                    {admin.followUp.columns.dueDate}
                  </th>
                  <th className="px-4 py-3 font-medium text-text-secondary">
                    {admin.followUp.columns.reason}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.overdueItems.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{item.storeName}</td>
                    <td className="px-4 py-3">{item.customerName}</td>
                    <td className="px-4 py-3">{maskPhone(item.customerPhone)}</td>
                    <td className="px-4 py-3">{item.assignedStaffName}</td>
                    <td className="px-4 py-3">{formatDate(item.followUpDate)}</td>
                    <td className="px-4 py-3">{item.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
