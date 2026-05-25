"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils/formatters";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";

interface RevenueByStoreChartProps {
  title: string;
  data: Array<{ name: string; revenue: number }>;
  revenueLabel: string;
}

export function RevenueByStoreChart({
  title,
  data,
  revenueLabel,
}: RevenueByStoreChartProps) {
  return (
    <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="var(--text-muted)"
              fontSize={11}
              interval={0}
            />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              stroke="var(--text-muted)"
              fontSize={11}
              width={70}
              fontFamily={NUMERIC_FONT_FAMILY}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), revenueLabel]}
              contentStyle={{ fontFamily: NUMERIC_FONT_FAMILY }}
            />
            <Bar dataKey="revenue" fill="#B8972E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
