import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDelta } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import type { InsightCard as InsightCardType } from "@/types";

interface InsightCardProps {
  insight: InsightCardType;
  actionLabel?: string;
  className?: string;
}

const severityStyles = {
  info: {
    border: "border-l-status-info",
    icon: Info,
    iconClass: "text-status-info",
    gradient: "from-status-info/10 to-transparent",
  },
  success: {
    border: "border-l-status-success",
    icon: CheckCircle2,
    iconClass: "text-status-success",
    gradient: "from-status-success/10 to-transparent",
  },
  warning: {
    border: "border-l-status-warning",
    icon: AlertTriangle,
    iconClass: "text-status-warning",
    gradient: "from-status-warning/10 to-transparent",
  },
  alert: {
    border: "border-l-status-error",
    icon: AlertTriangle,
    iconClass: "text-status-error",
    gradient: "from-status-error/10 to-transparent",
  },
} as const;

export function InsightCard({ insight, actionLabel, className }: InsightCardProps) {
  const styles = severityStyles[insight.severity];
  const Icon = styles.icon;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-card border border-border bg-surface-card p-5 shadow-card",
        "border-l-4 bg-gradient-to-r",
        styles.border,
        styles.gradient,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary",
            styles.iconClass,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-text-primary">
            {insight.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {insight.body}
          </p>

          {insight.metric && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-text-primary">
                {insight.metric.label}:{" "}
                <span className="font-numeric text-brand-gold">{insight.metric.value}</span>
              </span>
              {insight.metric.delta !== undefined && (
                <span
                  className={cn(
                    "font-numeric font-medium",
                    insight.metric.delta >= 0
                      ? "text-status-success"
                      : "text-status-error",
                  )}
                >
                  {formatDelta(insight.metric.delta)}
                </span>
              )}
            </div>
          )}

          {insight.action && (
            <Button asChild variant="link" className="mt-3 h-auto p-0 text-brand-gold">
              <Link href={insight.action.href}>
                {actionLabel ?? insight.action.label}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

interface InsightCardListProps {
  insights: InsightCardType[];
  actionLabel?: string;
  className?: string;
}

export function InsightCardList({
  insights,
  actionLabel,
  className,
}: InsightCardListProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          insight={insight}
          actionLabel={actionLabel}
        />
      ))}
    </div>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-surface-card p-5 shadow-card">
      <div className="flex gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-surface-secondary" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-2/3 animate-pulse rounded-input bg-surface-secondary" />
          <div className="h-4 w-full animate-pulse rounded-input bg-surface-secondary" />
          <div className="h-4 w-4/5 animate-pulse rounded-input bg-surface-secondary" />
        </div>
      </div>
    </div>
  );
}

export function InsightCardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <InsightCardSkeleton key={index} />
      ))}
    </div>
  );
}
