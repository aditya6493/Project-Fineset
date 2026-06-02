"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartCard } from "@/components/shared/ChartCard";
import { getChartSeriesColor } from "@/lib/charts/theme";
import type { BreakdownRow } from "@/types/admin-business-analytics";

interface AnalyticsPieChartProps {
  title: string;
  description?: string;
  data: BreakdownRow[];
  emptyMessage: string;
}

export function AnalyticsPieChart({
  title,
  description,
  data,
  emptyMessage,
}: AnalyticsPieChartProps) {
  if (data.length === 0) {
    return (
      <ChartCard title={title}>
        {description && <p className="mb-2 text-xs text-text-muted">{description}</p>}
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </ChartCard>
    );
  }

  const pieData = data.map((row, index) => ({
    name: row.label,
    value: row.count,
    fill: getChartSeriesColor(index),
  }));

  const config = Object.fromEntries(
    pieData.map((row) => [row.name, { label: row.name, color: row.fill }]),
  );

  return (
    <ChartCard title={title}>
      {description && <p className="mb-3 text-xs text-text-muted">{description}</p>}
      <ChartContainer config={config} className="mx-auto h-64 w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={84}
            paddingAngle={2}
            stroke="var(--surface-card)"
            strokeWidth={2}
          >
            {pieData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </ChartCard>
  );
}
