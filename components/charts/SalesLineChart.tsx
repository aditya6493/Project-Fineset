"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/shared/ChartCard";
import { CHART_COLORS } from "@/lib/charts/theme";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";

interface SalesLineChartProps {
  title: string;
  data: Array<{ date: string; visits: number; revenue: number }>;
  revenueLabel: string;
}

export function SalesLineChart({ title, data, revenueLabel }: SalesLineChartProps) {
  return (
    <ChartCard title={title}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatDate(value)}
              stroke={CHART_COLORS.axis}
              fontSize={12}
              fontFamily={NUMERIC_FONT_FAMILY}
            />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              stroke={CHART_COLORS.axis}
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
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.primary, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
