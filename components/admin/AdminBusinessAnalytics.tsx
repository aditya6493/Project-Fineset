"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminDashboardNav } from "@/components/admin/AdminDashboardNav";
import { AnalyticsAskPanel } from "@/components/admin/analytics/AnalyticsAskPanel";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStores } from "@/lib/api/stores";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { Content } from "@/content/en";

type AnalyticsContent = Content["admin"]["analytics"];

interface AdminBusinessAnalyticsProps {
  copy: AnalyticsContent;
  nav: Content["admin"]["nav"];
  common: Content["common"];
  errors: Content["errors"];
}

export function AdminBusinessAnalytics({
  copy,
  nav,
  common,
  errors,
}: AdminBusinessAnalyticsProps) {
  const [storeFilter, setStoreFilter] = useState("all");

  useEffect(() => {
    document.documentElement.classList.add("analytics-no-overscroll");
    return () => document.documentElement.classList.remove("analytics-no-overscroll");
  }, []);

  const { data: stores } = useQuery({
    queryKey: ["stores", "analytics-filter"],
    queryFn: () => getStores({ page: 1, pageSize: 100 }),
    ...LIVE_QUERY_OPTIONS,
  });

  const selectedStoreId = storeFilter === "all" ? undefined : storeFilter;

  return (
    <div className="mx-auto max-w-7xl space-y-8 overscroll-y-none" data-analytics-page>
      <div className="space-y-4">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-center font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl sm:text-left">
            {copy.title}
          </h1>
          <div className="shrink-0 space-y-1 sm:text-right">
            <Label htmlFor="analytics-store-filter" className="sr-only">
              {copy.storeFilterLabel}
            </Label>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger id="analytics-store-filter" className="w-full sm:w-56">
                <SelectValue placeholder={common.filter} />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">{copy.allStoresLabel}</SelectItem>
                {stores?.data.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>
        <AdminDashboardNav labels={nav} />
      </div>

      <AnalyticsAskPanel
        key={storeFilter}
        copy={copy.ask}
        common={common}
        errors={errors}
        kpis={copy.kpis}
        emptyBreakdown={copy.emptyBreakdown}
        storeId={selectedStoreId}
      />
    </div>
  );
}
