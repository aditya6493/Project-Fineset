import { describe, expect, it } from "vitest";
import {
  computeVisitValueTier,
  matchesCallQueue,
  matchesCallSegment,
  matchesCallValueTier,
} from "@/lib/services/call-list-utils";

describe("call-list-utils", () => {
  const baseVisit = {
    customerType: "NEW" as const,
    purchaseStatus: "NOT_PURCHASED" as const,
    transactionAmount: null,
    budgetStated: "ABOVE_1L" as const,
    staffId: "staff-1",
    followUp: { status: "OPEN" as const, assignedStaffId: "staff-1" },
    callLogs: [] as Array<{ answered: "ANSWERED" | "NOT_ANSWERED"; staffId?: string }>,
  };

  it("computes HIGH value tier from budget", () => {
    expect(computeVisitValueTier(baseVisit)).toBe("HIGH");
  });

  it("matches ALL segment filter", () => {
    expect(matchesCallSegment(baseVisit, "ALL")).toBe(true);
  });

  it("matches NEW segment filter", () => {
    expect(matchesCallSegment(baseVisit, "NEW")).toBe(true);
    expect(matchesCallSegment({ ...baseVisit, customerType: "REPEAT" }, "NEW")).toBe(
      false,
    );
  });

  it("matches value tier filters", () => {
    expect(matchesCallValueTier(baseVisit, "ALL")).toBe(true);
    expect(matchesCallValueTier(baseVisit, "HIGH")).toBe(true);
  });

  it("matches follow-up queue filter", () => {
    expect(matchesCallQueue(baseVisit, "FOLLOW_UP")).toBe(true);
    expect(
      matchesCallQueue(
        { ...baseVisit, followUp: null },
        "FOLLOW_UP",
      ),
    ).toBe(false);
  });

  it("matches not answered queue filter from call logs", () => {
    expect(
      matchesCallQueue(
        {
          ...baseVisit,
          followUp: null,
          callLogs: [{ answered: "NOT_ANSWERED", staffId: "staff-1" }],
        },
        "NOT_ANSWERED",
      ),
    ).toBe(true);
    expect(matchesCallQueue(baseVisit, "NOT_ANSWERED")).toBe(false);
  });
});
