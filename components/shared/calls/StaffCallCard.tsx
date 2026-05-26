"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/formatters";
import { badgeClass, getCallOutcomeKey } from "./call-badge-utils";
import type { StaffCallListItem } from "@/types";

interface StaffCallCardLabels {
  valueTierLabels: Record<string, string>;
  queueStatusLabels: Record<string, string>;
  callOutcomeLabels: Record<string, string>;
  purchaseStatusLabels: Record<string, string>;
  customerTypeLabels: Record<string, string>;
  notesLabel: string;
  due: string;
  call: string;
}

interface StaffCallCardProps {
  item: StaffCallListItem;
  labels: StaffCallCardLabels;
  onCall: (item: StaffCallListItem) => void;
}

export function StaffCallCard({ item, labels, onCall }: StaffCallCardProps) {
  const callOutcomeKey = getCallOutcomeKey(item.lastCallStatus);

  return (
    <article className="rounded-card border border-border bg-surface-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              {item.displayName}
            </h2>
            <Badge variant="outline" className={cn(badgeClass("value", item.valueTier))}>
              {labels.valueTierLabels[item.valueTier]}
            </Badge>
          </div>

          <p className="text-sm text-text-secondary">{item.visitSummary}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            {item.queue !== "ALL" && (
              <Badge variant="outline" className={cn(badgeClass("queue", item.queue))}>
                {labels.queueStatusLabels[item.queue]}
              </Badge>
            )}
            <Badge variant="outline" className={cn(badgeClass("callOutcome", callOutcomeKey))}>
              {labels.callOutcomeLabels[callOutcomeKey]}
            </Badge>
            <Badge variant="outline" className={cn(badgeClass("status", item.purchaseStatus))}>
              {labels.purchaseStatusLabels[item.purchaseStatus]}
            </Badge>
            <Badge variant="secondary">{labels.customerTypeLabels[item.customerType]}</Badge>
            <Badge variant="secondary">{item.visitDateLabel}</Badge>
            {item.followUpDueDate && item.queue === "FOLLOW_UP" && (
              <Badge variant="default">
                {labels.due} {formatDate(item.followUpDueDate)}
              </Badge>
            )}
          </div>

          {item.notes && (
            <div className="border-t border-border pt-2">
              <p className="text-sm text-text-secondary">
                <span className="font-medium text-text-primary">{labels.notesLabel}: </span>
                {item.notes}
              </p>
            </div>
          )}
        </div>

        <Button
          type="button"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full"
          disabled={!item.canCall}
          aria-label={labels.call}
          onClick={() => onCall(item)}
        >
          <Phone className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    </article>
  );
}
