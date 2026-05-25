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

interface NoPurchaseReasonsChartProps {
  title: string;
  data: Array<{ reason: string; count: number }>;
  countLabel: string;
}

export function NoPurchaseReasonsChart({
  title,
  data,
  countLabel,
}: NoPurchaseReasonsChartProps) {
  return (
    <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="reason"
              stroke="var(--text-muted)"
              fontSize={11}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="var(--text-muted)" fontSize={12} fontFamily={NUMERIC_FONT_FAMILY} />
            <Tooltip
              formatter={(value: number) => [value, countLabel]}
              contentStyle={{ fontFamily: NUMERIC_FONT_FAMILY }}
            />
            <Bar dataKey="count" fill="#B8972E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
