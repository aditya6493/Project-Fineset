"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getStores } from "@/lib/api/stores";
import { useStaffPerformance } from "@/hooks/useStaffPerformance";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import { storesParamsMatch, DEFAULT_STORES_FILTER_PARAMS } from "@/lib/query/initial-data";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import type { Content } from "@/content/en";
import type { PaginatedResponse, StaffPerformanceRow } from "@/types";

type AdminContent = Content["admin"];
type CommonContent = Content["common"];

interface StaffAnalyticsProps {
  admin: AdminContent;
  common: CommonContent;
  emptyMessage: string;
  allStoresLabel: string;
  initialStoreId?: string;
  initialPerformance?: StaffPerformanceRow[];
  initialStoreFilter?: string;
  backHref?: string;
  backLabel?: string;
  initialStores?: PaginatedResponse<{
    id: string;
    name: string;
    category: string;
    customCategory: string | null;
    city: string;
    state: string;
    pincode: string | null;
    pocName: string | null;
    pointOfContactPhone: string | null;
    email: string | null;
    isActive: boolean;
    staffCount: number;
    visits: number;
    createdAt: string;
  }>;
}

export function StaffAnalytics({
  admin,
  common,
  emptyMessage,
  allStoresLabel,
  initialStoreId,
  initialPerformance,
  initialStoreFilter,
  backHref,
  backLabel,
  initialStores,
}: StaffAnalyticsProps) {
  const [storeFilter, setStoreFilter] = useState<string>(initialStoreId ?? "all");

  const storesHydrated = initialStores !== undefined;
  const { data: stores } = useQuery({
    queryKey: ["stores", "filter"],
    queryFn: () => getStores({ page: 1, pageSize: 100 }),
    initialData: initialStores,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(
      storesHydrated &&
        storesParamsMatch(
          { page: 1, pageSize: 100 },
          DEFAULT_STORES_FILTER_PARAMS,
        ),
    ),
  });

  const { data, isLoading } = useStaffPerformance(storeFilter, {
    initialData: initialPerformance,
    initialStoreFilter: initialStoreFilter ?? initialStoreId ?? "all",
  });

  const leaderboard = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {backHref ? (
            <Link
              href={backHref}
              className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-brand-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel ?? "Back"}
            </Link>
          ) : null}
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {admin.staff.title}
          </h1>
        </div>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder={common.filter} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{allStoresLabel}</SelectItem>
            {stores?.data.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {leaderboard.length > 0 && (
        <section className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">
            {admin.staff.leaderboard}
          </h2>
          <ol className="space-y-2">
            {leaderboard.map((member, index) => (
              <li
                key={member.staffId}
                className="flex items-center justify-between rounded-input border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold font-numeric text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-text-primary">{member.staffName}</p>
                    <p className="text-xs text-text-muted">{member.storeName}</p>
                  </div>
                </div>
                <p className="font-numeric font-medium text-brand-gold">
                  {formatCurrency(member.revenue)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {isLoading ? (
        <div aria-live="polite" aria-busy="true">
          <Skeleton className="h-48 rounded-card" />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.staff.columns.name}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.staff.columns.store}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.staff.columns.visits}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.staff.columns.revenue}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.staff.columns.conversionRate}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.staff.columns.followUpRate}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((member) => (
                <tr key={member.staffId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{member.staffName}</td>
                  <td className="px-4 py-3">{member.storeName}</td>
                  <td className="px-4 py-3">{member.visits}</td>
                  <td className="px-4 py-3">{formatCurrency(member.revenue)}</td>
                  <td className="px-4 py-3">{formatPercent(member.conversionRate)}</td>
                  <td className="px-4 py-3">{formatPercent(member.followUpRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
