"use client";

import { useId } from "react";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/shared/ChartCard";
import {
  CHART_COLORS,
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
} from "@/lib/charts/theme";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";

interface SalesLineChartProps {
  title: string;
  data: Array<{ date: string; visits: number; revenue: number }>;
  revenueLabel: string;
}

export function SalesLineChart({ title, data, revenueLabel }: SalesLineChartProps) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <ChartCard title={title}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.28} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatDate(value)}
              stroke={CHART_COLORS.axis}
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              fontFamily={NUMERIC_FONT_FAMILY}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
            />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              stroke={CHART_COLORS.axis}
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              width={70}
              fontFamily={NUMERIC_FONT_FAMILY}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), revenueLabel]}
              labelFormatter={(label: string) => formatDate(label)}
              contentStyle={{
                ...CHART_TOOLTIP_CONTENT_STYLE,
                fontFamily: NUMERIC_FONT_FAMILY,
              }}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              itemStyle={CHART_TOOLTIP_ITEM_STYLE}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="none"
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              dot={{ fill: CHART_COLORS.primary, stroke: "#fff", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
