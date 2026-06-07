import type { StaffCallQueue } from "@/types";
import type { CallAnswerStatus, Prisma } from "@prisma/client";

export interface CallQueueSignals {
  hasOpenFollowUp: boolean;
  lastCallAnswered: CallAnswerStatus | null;
}

export function deriveCallQueue(
  signals: CallQueueSignals,
): Exclude<StaffCallQueue, "ALL"> {
  if (signals.lastCallAnswered === "NOT_ANSWERED") return "NOT_ANSWERED";
  if (signals.hasOpenFollowUp) return "FOLLOW_UP";
  return "RETENTION";
}

export function matchesCallQueueFilter(
  signals: CallQueueSignals,
  filter: StaffCallQueue,
): boolean {
  if (filter === "ALL") return true;
  if (filter === "NOT_ANSWERED") return signals.lastCallAnswered === "NOT_ANSWERED";
  if (filter === "FOLLOW_UP") return signals.hasOpenFollowUp;
  if (filter === "RETENTION") {
    return !signals.hasOpenFollowUp && signals.lastCallAnswered !== "NOT_ANSWERED";
  }
  return true;
}

export function buildFollowUpOpenWhere(staffId: string): Prisma.VisitWhereInput["followUp"] {
  return {
    is: {
      status: "OPEN",
      assignedStaffId: staffId,
    },
  };
}

export function buildFieldSaleFollowUpOpenWhere(
  staffId: string,
): Prisma.FieldSaleWhereInput["followUp"] {
  return {
    is: {
      status: "OPEN",
      assignedStaffId: staffId,
    },
  };
}

export function buildNotAnsweredWhere(): { lastCallAnswered: CallAnswerStatus } {
  return { lastCallAnswered: "NOT_ANSWERED" };
}

export function buildCallsPeriodRange(
  year: number,
  month: number,
): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export function extractCallQueueSignals(input: {
  staffId: string;
  followUp: { status: string; assignedStaffId: string } | null;
  lastCallAnswered?: CallAnswerStatus | null;
  callLogs?: Array<{ answered: CallAnswerStatus; staffId?: string }>;
}): CallQueueSignals {
  const hasOpenFollowUp =
    input.followUp?.status === "OPEN" &&
    input.followUp.assignedStaffId === input.staffId;

  const lastCallAnswered =
    input.lastCallAnswered ??
    (input.callLogs?.find((log) => log.staffId === input.staffId) ??
      input.callLogs?.[0])?.answered ??
    null;

  return { hasOpenFollowUp, lastCallAnswered };
}
