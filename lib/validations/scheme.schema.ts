import { z } from "zod";

export const schemeProductSchema = z.enum(["GHS", "GPP", "NONE"]);

export const schemeEnrollmentOutcomeSchema = z.enum([
  "ENROLLED_GHS",
  "ENROLLED_GPP",
  "ENROLLED_BOTH",
  "INTERESTED",
  "DECLINED",
  "CALLBACK",
]);

export const fieldDeclineReasonSchema = z.enum([
  "BUDGET",
  "ALREADY_ENROLLED",
  "NOT_INTERESTED",
  "NEEDS_TIME",
  "TRUST_CONCERNS",
  "COMPETITOR_SCHEME",
]);

export type SchemeProductValue = z.infer<typeof schemeProductSchema>;

export function hasNoneSchemesPitched(
  schemes: SchemeProductValue[],
): boolean {
  return schemes.includes("NONE");
}

export function hasActualSchemesPitched(
  schemes: SchemeProductValue[],
): boolean {
  return schemes.some((scheme) => scheme === "GHS" || scheme === "GPP");
}

export function normalizeSchemesPitched<
  T extends {
    schemesPitched: SchemeProductValue[];
    enrollmentOutcome?: z.infer<typeof schemeEnrollmentOutcomeSchema>;
    monthlyCommitment?: number;
    reasonNoEnrollment?: z.infer<typeof fieldDeclineReasonSchema>;
    schemeCompetitorMention?: string;
  },
>(data: T): T {
  if (!hasNoneSchemesPitched(data.schemesPitched)) {
    return data;
  }

  return {
    ...data,
    schemesPitched: ["NONE"],
    enrollmentOutcome: undefined,
    monthlyCommitment: undefined,
    reasonNoEnrollment: undefined,
    schemeCompetitorMention: undefined,
  };
}

export interface SchemeFieldValues {
  schemesPitched: SchemeProductValue[];
  enrollmentOutcome?: z.infer<typeof schemeEnrollmentOutcomeSchema>;
  monthlyCommitment?: number;
  reasonNoEnrollment?: z.infer<typeof fieldDeclineReasonSchema>;
}

export function refineSchemeFields(
  data: SchemeFieldValues,
  ctx: z.RefinementCtx,
  options?: { requireOutcome?: boolean },
): void {
  if (
    hasNoneSchemesPitched(data.schemesPitched) &&
    hasActualSchemesPitched(data.schemesPitched)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "None cannot be selected with other schemes",
      path: ["schemesPitched"],
    });
    return;
  }

  if (hasNoneSchemesPitched(data.schemesPitched)) {
    if (data.enrollmentOutcome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enrollment outcome is not applicable when no schemes were pitched",
        path: ["enrollmentOutcome"],
      });
    }
    if (data.monthlyCommitment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Monthly commitment is not applicable when no schemes were pitched",
        path: ["monthlyCommitment"],
      });
    }
    if (data.reasonNoEnrollment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reason is not applicable when no schemes were pitched",
        path: ["reasonNoEnrollment"],
      });
    }
    return;
  }

  const hasSchemes = hasActualSchemesPitched(data.schemesPitched);
  const hasOutcome = Boolean(data.enrollmentOutcome);

  if (options?.requireOutcome && !hasOutcome) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enrollment outcome is required",
      path: ["enrollmentOutcome"],
    });
    return;
  }

  if (hasSchemes && !hasOutcome) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select an outcome when schemes are pitched",
      path: ["enrollmentOutcome"],
    });
    return;
  }

  if (hasOutcome && !hasSchemes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select at least one scheme pitched",
      path: ["schemesPitched"],
    });
    return;
  }

  if (!data.enrollmentOutcome) return;

  const enrolledOutcomes = ["ENROLLED_GHS", "ENROLLED_GPP", "ENROLLED_BOTH"] as const;
  const needsReason = ["DECLINED", "CALLBACK"] as const;

  if (
    data.enrollmentOutcome === "ENROLLED_GHS" &&
    !data.schemesPitched.includes("GHS")
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "GHS must be pitched when enrolling in GHS",
      path: ["schemesPitched"],
    });
  }

  if (
    data.enrollmentOutcome === "ENROLLED_GPP" &&
    !data.schemesPitched.includes("GPP")
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "JPP must be pitched when enrolling in JPP",
      path: ["schemesPitched"],
    });
  }

  if (
    data.enrollmentOutcome === "ENROLLED_BOTH" &&
    (!data.schemesPitched.includes("GHS") || !data.schemesPitched.includes("GPP"))
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Both GHS and JPP must be pitched for dual enrollment",
      path: ["schemesPitched"],
    });
  }

  if (
    enrolledOutcomes.includes(
      data.enrollmentOutcome as (typeof enrolledOutcomes)[number],
    ) &&
    !data.monthlyCommitment
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Monthly commitment is required when a scheme is enrolled",
      path: ["monthlyCommitment"],
    });
  }

  if (
    needsReason.includes(data.enrollmentOutcome as (typeof needsReason)[number]) &&
    !data.reasonNoEnrollment
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Reason is required for this outcome",
      path: ["reasonNoEnrollment"],
    });
  }
}
