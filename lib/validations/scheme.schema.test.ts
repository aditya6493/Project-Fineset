import { describe, expect, it } from "vitest";
import {
  hasActualSchemesPitched,
  hasNoneSchemesPitched,
  normalizeSchemesPitched,
  refineSchemeFields,
} from "@/lib/validations/scheme.schema";
import type { z } from "zod";

function runRefine(data: Parameters<typeof refineSchemeFields>[0]) {
  const issues: z.ZodIssue[] = [];
  refineSchemeFields(data, {
    addIssue: (issue) => {
      issues.push(issue as z.ZodIssue);
    },
  } as z.RefinementCtx);
  return issues;
}

describe("scheme.schema", () => {
  it("accepts explicit none selection without enrollment outcome", () => {
    const issues = runRefine({
      schemesPitched: ["NONE"],
    });
    expect(issues).toHaveLength(0);
  });

  it("rejects mixing none with pitched schemes", () => {
    const issues = runRefine({
      schemesPitched: ["NONE", "GHS"],
    });
    expect(issues.some((issue) => issue.path.includes("schemesPitched"))).toBe(
      true,
    );
  });

  it("rejects enrollment outcome when none is selected", () => {
    const issues = runRefine({
      schemesPitched: ["NONE"],
      enrollmentOutcome: "DECLINED",
    });
    expect(issues.some((issue) => issue.path.includes("enrollmentOutcome"))).toBe(
      true,
    );
  });

  it("still requires outcome when actual schemes are pitched", () => {
    const issues = runRefine({
      schemesPitched: ["GHS"],
    });
    expect(issues.some((issue) => issue.path.includes("enrollmentOutcome"))).toBe(
      true,
    );
  });

  it("normalizes none selections and clears outcome fields", () => {
    expect(
      normalizeSchemesPitched({
        schemesPitched: ["NONE"],
        enrollmentOutcome: "DECLINED",
        monthlyCommitment: 5000,
        reasonNoEnrollment: "NOT_INTERESTED",
        schemeCompetitorMention: "Other jeweller",
      }),
    ).toEqual({
      schemesPitched: ["NONE"],
      enrollmentOutcome: undefined,
      monthlyCommitment: undefined,
      reasonNoEnrollment: undefined,
      schemeCompetitorMention: undefined,
    });
  });

  it("detects actual pitched schemes", () => {
    expect(hasActualSchemesPitched(["GHS"])).toBe(true);
    expect(hasActualSchemesPitched(["NONE"])).toBe(false);
    expect(hasNoneSchemesPitched(["NONE"])).toBe(true);
  });
});
