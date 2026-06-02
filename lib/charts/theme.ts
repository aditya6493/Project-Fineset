import type { CSSProperties } from "react";

/** Core chart chrome — axes, grids, and default series strokes. */
export const CHART_COLORS = {
  primary: "var(--chart-primary)",
  secondary: "var(--chart-secondary)",
  axis: "var(--chart-axis)",
  grid: "var(--chart-grid)",
  tooltipBg: "var(--chart-tooltip-bg)",
  tooltipBorder: "var(--chart-tooltip-border)",
} as const;

/** Period A vs B — distinct hues for color-vision accessibility (not gold-on-gold). */
export const CHART_COMPARE = {
  current: "var(--chart-compare-current)",
  prior: "var(--chart-compare-prior)",
} as const;

/**
 * Categorical palette: brand gold anchor + teal, plum, terracotta, blue, etc.
 * Chosen for contrast on white and distinguishability for common CVD types.
 */
export const CHART_SERIES_COLORS = [
  "var(--chart-series-1)",
  "var(--chart-series-2)",
  "var(--chart-series-3)",
  "var(--chart-series-4)",
  "var(--chart-series-5)",
  "var(--chart-series-6)",
  "var(--chart-series-7)",
  "var(--chart-series-8)",
] as const;

/** @deprecated Use CHART_SERIES_COLORS */
export const COHORT_CHART_COLORS = CHART_SERIES_COLORS;

export function getChartSeriesColor(index: number): string {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]!;
}

/** Shared Recharts tooltip chrome for non-shadcn charts. */
export const CHART_TOOLTIP_CONTENT_STYLE: CSSProperties = {
  backgroundColor: "var(--chart-tooltip-bg)",
  border: "1px solid var(--chart-tooltip-border)",
  borderRadius: "0.5rem",
  boxShadow: "0 4px 14px rgba(28, 28, 30, 0.1)",
  color: "var(--text-primary)",
  fontSize: "0.75rem",
  padding: "0.5rem 0.75rem",
};

export const CHART_TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: "var(--text-secondary)",
  fontWeight: 600,
  marginBottom: "0.25rem",
};

export const CHART_TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: "var(--text-primary)",
};

export const CHART_LEGEND_STYLE: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-secondary)",
  paddingTop: "0.5rem",
};
