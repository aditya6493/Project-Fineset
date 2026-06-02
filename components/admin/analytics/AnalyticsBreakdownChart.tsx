"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getChartSeriesColor, CHART_COLORS } from "@/lib/charts/theme";
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
  const chartData = data.map((row, index) => ({
    name: row.label,
    count: row.count,
    fill: getChartSeriesColor(index),
  }));

  const config = Object.fromEntries(
    chartData.map((row) => [row.name, { label: row.name, color: row.fill }]),
  );

  return (
    <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">{title}</h3>
      {chartData.length === 0 ? (
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      ) : (
        <ChartContainer config={config} className="h-64 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 4 }}>
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {chartData.map((row) => (
                <Cell key={row.name} fill={row.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
