import { describe, expect, it } from "vitest";
import {
  deriveCallQueue,
  extractCallQueueSignals,
  matchesCallQueueFilter,
} from "@/lib/services/call-queue-utils";

describe("call-queue-utils", () => {
  it("derives NOT_ANSWERED before FOLLOW_UP when both apply", () => {
    expect(
      deriveCallQueue({
        hasOpenFollowUp: true,
        lastCallAnswered: "NOT_ANSWERED",
      }),
    ).toBe("NOT_ANSWERED");
  });

  it("derives FOLLOW_UP when open follow-up and no not-answered call", () => {
    expect(
      deriveCallQueue({
        hasOpenFollowUp: true,
        lastCallAnswered: null,
      }),
    ).toBe("FOLLOW_UP");
  });

  it("derives RETENTION when no follow-up and no not-answered call", () => {
    expect(
      deriveCallQueue({
        hasOpenFollowUp: false,
        lastCallAnswered: "ANSWERED",
      }),
    ).toBe("RETENTION");
  });

  it("matches queue filters independently", () => {
    const both = { hasOpenFollowUp: true, lastCallAnswered: "NOT_ANSWERED" as const };
    expect(matchesCallQueueFilter(both, "NOT_ANSWERED")).toBe(true);
    expect(matchesCallQueueFilter(both, "FOLLOW_UP")).toBe(true);
    expect(matchesCallQueueFilter(both, "RETENTION")).toBe(false);
  });

  it("extracts signals from call logs", () => {
    expect(
      extractCallQueueSignals({
        staffId: "staff-1",
        followUp: null,
        callLogs: [{ answered: "NOT_ANSWERED", staffId: "staff-1" }],
      }),
    ).toEqual({
      hasOpenFollowUp: false,
      lastCallAnswered: "NOT_ANSWERED",
    });
  });
});
