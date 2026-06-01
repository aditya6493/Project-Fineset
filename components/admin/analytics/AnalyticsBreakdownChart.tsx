"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { BreakdownRow } from "@/types/admin-business-analytics";

interface AnalyticsBreakdownChartProps {
  title: string;
  data: BreakdownRow[];
  emptyMessage: string;
}

export function AnalyticsBreakdownChart({
  title,
  data,
  emptyMessage,
}: AnalyticsBreakdownChartProps) {
  const chartData = data.map((row) => ({
    name: row.label,
    count: row.count,
  }));

  const config = {
    count: { label: "Count", color: "var(--chart-primary)" },
  };

  return (
    <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">{title}</h3>
      {chartData.length === 0 ? (
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      ) : (
        <ChartContainer config={config} className="h-64 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
