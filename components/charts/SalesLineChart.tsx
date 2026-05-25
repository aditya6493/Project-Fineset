"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";

interface SalesLineChartProps {
  title: string;
  data: Array<{ date: string; visits: number; revenue: number }>;
  revenueLabel: string;
}

export function SalesLineChart({ title, data, revenueLabel }: SalesLineChartProps) {
  return (
    <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatDate(value)}
              stroke="var(--text-muted)"
              fontSize={12}
              fontFamily={NUMERIC_FONT_FAMILY}
            />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              stroke="var(--text-muted)"
              fontSize={12}
              width={70}
              fontFamily={NUMERIC_FONT_FAMILY}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), revenueLabel]}
              labelFormatter={(label: string) => formatDate(label)}
              contentStyle={{ fontFamily: NUMERIC_FONT_FAMILY }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#B8972E"
              strokeWidth={2}
              dot={{ fill: "#B8972E", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
