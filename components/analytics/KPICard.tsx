import { cn } from "@/lib/utils";
import { formatDelta } from "@/lib/utils/formatters";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaPeriod?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function KPICard({
  label,
  value,
  unit,
  delta,
  deltaPeriod,
  icon,
  isLoading,
  className,
}: KPICardProps) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString("en-IN") : value;

  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon && <div className="text-brand-gold">{icon}</div>}
      </div>
      {isLoading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded-input bg-surface-secondary" />
      ) : (
        <>
          <p className="mt-2 font-numeric text-2xl font-bold text-text-primary sm:text-3xl">
            {unit && unit !== "%" ? `${unit} ` : ""}
            {displayValue}
            {unit === "%" ? "%" : ""}
          </p>
          {delta !== undefined && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {delta >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-status-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-status-error" />
              )}
              <span
                className={cn(
                  "font-numeric font-medium",
                  delta >= 0 ? "text-status-success" : "text-status-error",
                )}
              >
                {formatDelta(delta)}
              </span>
              {deltaPeriod && (
                <span className="text-text-muted">{deltaPeriod}</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
