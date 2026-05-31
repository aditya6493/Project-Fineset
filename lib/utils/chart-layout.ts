export const CHART_GRID_CLASS = "grid gap-4 lg:grid-cols-2 [&>*]:min-w-0";

export const CHART_CARD_CLASS = "min-w-0 overflow-hidden border-border bg-surface-secondary/30";

export const CHART_CARD_HEADER_CLASS = "space-y-1.5 px-4 pb-2 pt-4 sm:px-6 sm:pt-6";

export const CHART_CARD_CONTENT_CLASS = "overflow-hidden px-4 pt-0 sm:px-6";

export const VERTICAL_BAR_CHART_MARGIN = {
  top: 4,
  right: 12,
  left: 0,
  bottom: 4,
} as const;

export const TIME_SERIES_CHART_MARGIN = {
  top: 8,
  right: 12,
  left: 0,
  bottom: 0,
} as const;

export function truncateChartLabel(label: string, maxLength = 14): string {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}…`;
}

export function formatChartDateTick(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export const TABS_LIST_SCROLL_CLASS =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
