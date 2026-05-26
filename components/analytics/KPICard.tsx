import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/utils/formatters";
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
        "min-w-0 overflow-hidden rounded-card border border-border bg-surface-card p-3 shadow-card sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-snug text-text-secondary sm:text-sm">
          {label}
        </p>
        {icon && (
          <div className="shrink-0 text-brand-gold">{icon}</div>
        )}
      </div>
      {isLoading ? (
        <div className="mt-2 h-7 w-20 animate-pulse rounded-input bg-surface-secondary sm:mt-3 sm:h-8 sm:w-24" />
      ) : (
        <>
          <p className="mt-1.5 break-words font-numeric text-lg font-bold leading-tight text-text-primary sm:mt-2 sm:text-2xl lg:text-3xl">
            {unit && unit !== "%" ? `${unit} ` : ""}
            {displayValue}
            {unit === "%" ? "%" : ""}
          </p>
          {delta !== undefined && (
            <div className="mt-1.5 space-y-0.5 sm:mt-2">
              <div className="flex items-center gap-1 text-xs">
                {delta >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-status-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 shrink-0 text-status-error" />
                )}
                <span
                  className={cn(
                    "font-numeric font-medium",
                    delta >= 0 ? "text-status-success" : "text-status-error",
                  )}
                >
                  {formatPercent(Math.abs(delta))}
                </span>
              </div>
              {deltaPeriod && (
                <p className="text-[11px] leading-tight text-text-muted sm:text-xs">
                  {deltaPeriod}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
