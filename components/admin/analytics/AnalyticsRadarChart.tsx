"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartCard } from "@/components/shared/ChartCard";
import {
  CHART_COLORS,
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
} from "@/lib/charts/theme";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";
import type { AnalyticsAskRadarPoint } from "@/types/admin-business-analytics-ask";

interface AnalyticsRadarChartProps {
  title: string;
  description?: string;
  data: AnalyticsAskRadarPoint[];
  emptyMessage: string;
}

export function AnalyticsRadarChart({
  title,
  description,
  data,
  emptyMessage,
}: AnalyticsRadarChartProps) {
  if (data.length === 0) {
    return (
      <ChartCard title={title}>
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title}>
      {description && <p className="mb-3 text-xs text-text-muted">{description}</p>}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke={CHART_COLORS.grid} />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                ...CHART_TOOLTIP_CONTENT_STYLE,
                fontFamily: NUMERIC_FONT_FAMILY,
              }}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              itemStyle={CHART_TOOLTIP_ITEM_STYLE}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke={CHART_COLORS.secondary}
              fill={CHART_COLORS.secondary}
              fillOpacity={0.22}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
