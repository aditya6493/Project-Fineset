"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { getStoreCategoryLabel } from "@/lib/utils/store-category";
import type { Content } from "@/content/en";
import type { StorePerformanceRow } from "@/types";

type AdminContent = Content["admin"];

function SortHeader({
  label,
  sortKey,
  activeKey,
  sortAsc,
  onClick,
}: {
  label: string;
  sortKey: keyof StorePerformanceRow;
  activeKey: keyof StorePerformanceRow;
  sortAsc: boolean;
  onClick: () => void;
}) {
  const sortState =
    activeKey === sortKey ? (sortAsc ? "ascending" : "descending") : "none";

  return (
    <TableHead scope="col">
      <button
        type="button"
        className="font-medium text-text-secondary hover:text-brand-gold"
        onClick={onClick}
        aria-sort={sortState}
      >
        {label}
      </button>
    </TableHead>
  );
}

export function StorePerformanceTable({
  stores,
  admin,
}: {
  stores: StorePerformanceRow[];
  admin: AdminContent;
}) {
  const [sortKey, setSortKey] = useState<keyof StorePerformanceRow>("revenue");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...stores].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [sortAsc, sortKey, stores]);

  function toggleSort(key: keyof StorePerformanceRow) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface-card shadow-card">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          {admin.overview.title}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{admin.overview.subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHeader
                label={admin.stores.columns.name}
                sortKey="storeName"
                activeKey={sortKey}
                sortAsc={sortAsc}
                onClick={() => toggleSort("storeName")}
              />
              <SortHeader
                label={admin.stores.columns.category}
                sortKey="category"
                activeKey={sortKey}
                sortAsc={sortAsc}
                onClick={() => toggleSort("category")}
              />
              <SortHeader
                label={admin.stores.columns.city}
                sortKey="city"
                activeKey={sortKey}
                sortAsc={sortAsc}
                onClick={() => toggleSort("city")}
              />
              <SortHeader
                label={admin.kpis.totalVisits}
                sortKey="visits"
                activeKey={sortKey}
                sortAsc={sortAsc}
                onClick={() => toggleSort("visits")}
              />
              <SortHeader
                label={admin.kpis.totalRevenue}
                sortKey="revenue"
                activeKey={sortKey}
                sortAsc={sortAsc}
                onClick={() => toggleSort("revenue")}
              />
              <SortHeader
                label={admin.kpis.conversionRate}
                sortKey="conversionRate"
                activeKey={sortKey}
                sortAsc={sortAsc}
                onClick={() => toggleSort("conversionRate")}
              />
              <SortHeader
                label={admin.kpis.totalStaff}
                sortKey="staffCount"
                activeKey={sortKey}
                sortAsc={sortAsc}
                onClick={() => toggleSort("staffCount")}
              />
              <TableHead scope="col" className="font-medium text-text-secondary">
                {admin.overview.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((store) => (
              <TableRow key={store.storeId}>
                <TableCell className="font-medium">{store.storeName}</TableCell>
                <TableCell>{getStoreCategoryLabel(store.category)}</TableCell>
                <TableCell>{store.city}</TableCell>
                <TableCell>{store.visits}</TableCell>
                <TableCell>{formatCurrency(store.revenue)}</TableCell>
                <TableCell>{formatPercent(store.conversionRate)}</TableCell>
                <TableCell>{store.staffCount}</TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/admin/dashboard/stores/${store.storeId}`}
                      prefetch={false}
                    >
                      {admin.overview.viewDetails}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
