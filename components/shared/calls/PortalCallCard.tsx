import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { badgeClass, getCallOutcomeKey } from "./call-badge-utils";
import type { PortalCallListItem } from "@/types";

interface PortalCallCardLabels {
  staff: string;
  due: string;
  notesLabel: string;
  queueStatusLabels: Record<string, string>;
  callOutcomeLabels: Record<string, string>;
  purchaseStatusLabels: Record<string, string>;
  customerTypeLabels: Record<string, string>;
  valueTierLabels: Record<string, string>;
}

interface PortalCallCardProps {
  item: PortalCallListItem;
  labels: PortalCallCardLabels;
  showStoreName?: boolean;
}

export function PortalCallCard({ item, labels, showStoreName = false }: PortalCallCardProps) {
  const callOutcomeKey = getCallOutcomeKey(item.lastCallStatus);

  return (
    <article className="rounded-card border border-border bg-surface-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-text-primary">{item.customerName}</p>
          <p className="text-sm text-text-muted">{item.customerPhone}</p>
          <p className="mt-1 text-xs text-text-muted">
            {labels.staff}: {item.staffName}
            {showStoreName ? ` · ${item.storeName}` : ""}
          </p>
        </div>
        <div className="text-right text-xs text-text-muted">
          <p>{item.visitDateLabel}</p>
          {item.followUpDueDate && (
            <p>
              {labels.due}: {formatDate(item.followUpDueDate)}
            </p>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm text-text-secondary">{item.visitSummary}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className={cn(badgeClass("queue", item.queue))}>
          {labels.queueStatusLabels[item.queue]}
        </Badge>
        <Badge variant="outline" className={cn(badgeClass("callOutcome", callOutcomeKey))}>
          {labels.callOutcomeLabels[callOutcomeKey]}
        </Badge>
        <Badge variant="outline" className={cn(badgeClass("status", item.purchaseStatus))}>
          {labels.purchaseStatusLabels[item.purchaseStatus]}
        </Badge>
        <Badge variant="outline" className={cn(badgeClass("segment", item.customerType))}>
          {labels.customerTypeLabels[item.customerType]}
        </Badge>
        <Badge variant="outline" className={cn(badgeClass("value", item.valueTier))}>
          {labels.valueTierLabels[item.valueTier]}
        </Badge>
      </div>

      {item.notes && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs font-medium text-text-muted">{labels.notesLabel}</p>
          <p className="mt-1 text-sm text-text-secondary">{item.notes}</p>
        </div>
      )}
    </article>
  );
}
