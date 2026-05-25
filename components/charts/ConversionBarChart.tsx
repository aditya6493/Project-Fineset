"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";

interface ConversionBarChartProps {
  title: string;
  data: Array<{ name: string; count: number }>;
  countLabel: string;
}

export function ConversionBarChart({
  title,
  data,
  countLabel,
}: ConversionBarChartProps) {
  return (
    <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
            <XAxis type="number" stroke="var(--text-muted)" fontSize={12} fontFamily={NUMERIC_FONT_FAMILY} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              stroke="var(--text-muted)"
              fontSize={11}
            />
            <Tooltip
              formatter={(value: number) => [value, countLabel]}
              contentStyle={{ fontFamily: NUMERIC_FONT_FAMILY }}
            />
            <Bar dataKey="count" fill="#B8972E" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
