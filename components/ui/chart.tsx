"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  }
>;

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-auto w-full min-w-0 max-w-full justify-center overflow-hidden text-xs [&_.recharts-responsive-container]:!w-full [&_.recharts-responsive-container]:max-w-full [&_.recharts-wrapper]:max-w-full [&_.recharts-cartesian-axis-tick_text]:fill-text-muted [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, item]) => item.color);

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([, item]) => item.color)
          .map(
            ([key, item]) =>
              `[data-chart=${id}] { --color-${key}: ${item.color}; }`,
          )
          .join("\n"),
      }}
    />
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  className,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    labelFormatter?: (label: string) => string;
  }) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "grid min-w-[8rem] gap-1.5 rounded-lg border border-border bg-surface-card px-2.5 py-1.5 text-xs",
        className,
      )}
    >
      {label != null && (
        <p className="font-medium text-text-primary">
          {labelFormatter && typeof label === "string"
            ? labelFormatter(label)
            : String(label)}
        </p>
      )}
      <div className="grid gap-1">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? "value");
          const entry = config[key];
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-text-secondary">
                {entry?.label ?? item.name ?? key}
              </span>
              <span className="font-numeric font-medium text-text-primary">
                {typeof item.value === "number"
                  ? item.value.toLocaleString("en-IN")
                  : String(item.value ?? "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ChartLegend = RechartsPrimitive.Legend;

export function ChartLegendContent({
  className,
  payload,
}: React.ComponentProps<"div"> & {
  payload?: Array<{ value?: string; color?: string; dataKey?: string }>;
}) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4 pt-3", className)}>
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value);
        const entry = config[key];
        return (
          <div key={key} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span
              className="h-2 w-2 shrink-0 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {entry?.label ?? item.value}
          </div>
        );
      })}
    </div>
  );
}
