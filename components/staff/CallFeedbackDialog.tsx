"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Content } from "@/content/en";
import type { StaffCallDialResult, StaffCallListItem } from "@/types";
import type { StaffCallOutcomeInput } from "@/lib/validations/staff-calls.schema";
import { formatDateForInput, parseDateInput } from "@/components/forms/VisitForm/VisitForm.types";

type StaffCallsCopy = Content["staff"]["calls"];

interface CallFeedbackDialogProps {
  copy: StaffCallsCopy;
  item: StaffCallListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialInfo: StaffCallDialResult | null;
  isDialLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (payload: StaffCallOutcomeInput) => void;
}

export function CallFeedbackDialog({
  copy,
  item,
  open,
  onOpenChange,
  dialInfo,
  isDialLoading,
  isSubmitting,
  onSubmit,
}: CallFeedbackDialogProps) {
  const [answered, setAnswered] = useState<"ANSWERED" | "NOT_ANSWERED" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  function resetForm() {
    setAnswered(null);
    setFeedback("");
    setScheduleFollowUp(false);
    setFollowUpDate("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit() {
    if (!answered) return;

    onSubmit({
      answered,
      feedback: feedback.trim() || undefined,
      scheduleFollowUp: answered === "ANSWERED" ? scheduleFollowUp : false,
      followUpDate:
        answered === "ANSWERED" && scheduleFollowUp && followUpDate
          ? parseDateInput(followUpDate)
          : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.dialog.title}</DialogTitle>
          <DialogDescription>
            {item
              ? copy.dialog.description.replace("{name}", item.displayName)
              : copy.dialog.descriptionGeneric}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-input border border-border bg-surface-secondary p-4">
            {isDialLoading ? (
              <p className="text-sm text-text-secondary">{copy.dialog.revealingPhone}</p>
            ) : dialInfo ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{dialInfo.displayName}</p>
                  <p className="text-sm text-text-secondary">{dialInfo.phone}</p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <a href={dialInfo.dialUrl}>
                    <Phone className="h-4 w-4" aria-hidden />
                    {copy.call}
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">{copy.noPhone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{copy.dialog.outcomeLabel}</Label>
            <RadioGroup
              value={answered ?? ""}
              onValueChange={(value) =>
                setAnswered(value as "ANSWERED" | "NOT_ANSWERED")
              }
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="ANSWERED" id="outcome-answered" />
                <Label htmlFor="outcome-answered">{copy.dialog.answered}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="NOT_ANSWERED" id="outcome-not-answered" />
                <Label htmlFor="outcome-not-answered">{copy.dialog.notAnswered}</Label>
              </div>
            </RadioGroup>
          </div>

          {answered === "ANSWERED" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="call-feedback">{copy.dialog.feedbackLabel}</Label>
                <Textarea
                  id="call-feedback"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder={copy.dialog.feedbackPlaceholder}
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-input border border-border px-4 py-3">
                <Label htmlFor="schedule-follow-up" className="mt-0">
                  {copy.dialog.scheduleFollowUp}
                </Label>
                <Switch
                  id="schedule-follow-up"
                  checked={scheduleFollowUp}
                  onCheckedChange={setScheduleFollowUp}
                />
              </div>

              {scheduleFollowUp && (
                <div className="space-y-2">
                  <Label htmlFor="follow-up-date">{copy.dialog.followUpDateLabel}</Label>
                  <Input
                    id="follow-up-date"
                    type="date"
                    value={followUpDate}
                    onChange={(event) => setFollowUpDate(event.target.value)}
                    min={formatDateForInput(new Date())}
                  />
                </div>
              )}
            </div>
          )}

          {answered === "NOT_ANSWERED" && (
            <div className="space-y-2">
              <Label htmlFor="not-answered-note">{copy.dialog.notAnsweredNoteLabel}</Label>
              <Textarea
                id="not-answered-note"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder={copy.dialog.notAnsweredNotePlaceholder}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-text-muted">{copy.dialog.notAnsweredHint}</p>
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={
              !answered ||
              isSubmitting ||
              isDialLoading ||
              (answered === "ANSWERED" && scheduleFollowUp && !followUpDate)
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? copy.dialog.saving : copy.dialog.saveOutcome}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
