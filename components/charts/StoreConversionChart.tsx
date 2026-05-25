"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercent } from "@/lib/utils/formatters";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";

interface StoreConversionChartProps {
  title: string;
  data: Array<{ name: string; conversionRate: number }>;
  rateLabel: string;
}

export function StoreConversionChart({
  title,
  data,
  rateLabel,
}: StoreConversionChartProps) {
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
              tickFormatter={(value: number) => formatPercent(value)}
              stroke="var(--text-muted)"
              fontSize={11}
              width={50}
              fontFamily={NUMERIC_FONT_FAMILY}
            />
            <Tooltip
              formatter={(value: number) => [formatPercent(value), rateLabel]}
              contentStyle={{ fontFamily: NUMERIC_FONT_FAMILY }}
            />
            <Bar dataKey="conversionRate" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
