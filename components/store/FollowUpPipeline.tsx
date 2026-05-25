"use client";

import { useState } from "react";
import { useFollowUps, useUpdateFollowUpStatus } from "@/hooks/useFollowUps";
import { maskPhone, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Content } from "@/content/en";
import type { FollowUpStatus } from "@/types";

type StoreContent = Content["store"];

interface FollowUpPipelineProps {
  store: StoreContent;
  emptyMessage: string;
}

type FilterKey = "open" | "overdue" | "closed";

export function FollowUpPipeline({ store, emptyMessage }: FollowUpPipelineProps) {
  const [filter, setFilter] = useState<FilterKey>("open");

  const queryParams =
    filter === "open"
      ? { status: "OPEN" as FollowUpStatus }
      : filter === "overdue"
        ? { overdue: true }
        : { status: "CLOSED" as FollowUpStatus };

  const { data, isLoading } = useFollowUps(queryParams);
  const updateStatus = useUpdateFollowUpStatus();

  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: "open", label: store.followUp.filters.open },
    { key: "overdue", label: store.followUp.filters.overdue },
    { key: "closed", label: store.followUp.filters.closed },
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-text-primary">
        {store.followUp.title}
      </h1>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.key}
            type="button"
            size="sm"
            variant={filter === item.key ? "default" : "outline"}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-card bg-surface-secondary" />
      ) : !data || data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card shadow-card">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.followUp.columns.customer}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.followUp.columns.phone}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.followUp.columns.assignedStaff}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.followUp.columns.dueDate}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.followUp.columns.reason}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.followUp.columns.status}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary" />
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{item.customerName}</td>
                  <td className="px-4 py-3">{maskPhone(item.customerPhone)}</td>
                  <td className="px-4 py-3">{item.assignedStaffName}</td>
                  <td className="px-4 py-3">{formatDate(item.followUpDate)}</td>
                  <td className="px-4 py-3">{item.reason ?? "—"}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">
                    {item.status === "OPEN" && (
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={updateStatus.isPending}
                          onClick={() =>
                            updateStatus.mutate({
                              followUpId: item.id,
                              status: "CLOSED",
                            })
                          }
                        >
                          {store.followUp.actions.markClosed}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={updateStatus.isPending}
                          onClick={() =>
                            updateStatus.mutate({
                              followUpId: item.id,
                              status: "CONVERTED",
                            })
                          }
                        >
                          {store.followUp.actions.markConverted}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
