import { z } from "zod";

export const schemeProductSchema = z.enum(["GHS", "GPP"]);

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

export interface SchemeFieldValues {
  schemesPitched: z.infer<typeof schemeProductSchema>[];
  enrollmentOutcome?: z.infer<typeof schemeEnrollmentOutcomeSchema>;
  monthlyCommitment?: number;
  reasonNoEnrollment?: z.infer<typeof fieldDeclineReasonSchema>;
}

export function refineSchemeFields(
  data: SchemeFieldValues,
  ctx: z.RefinementCtx,
  options?: { requireOutcome?: boolean },
): void {
  const hasSchemes = data.schemesPitched.length > 0;
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
      message: "GPP must be pitched when enrolling in GPP",
      path: ["schemesPitched"],
    });
  }

  if (
    data.enrollmentOutcome === "ENROLLED_BOTH" &&
    (!data.schemesPitched.includes("GHS") || !data.schemesPitched.includes("GPP"))
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Both GHS and GPP must be pitched for dual enrollment",
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
