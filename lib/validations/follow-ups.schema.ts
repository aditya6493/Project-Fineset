import { z } from "zod";

export const followUpQuerySchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "CONVERTED", "NO_RESPONSE"]).optional(),
  overdue: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const updateFollowUpSchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "CONVERTED", "NO_RESPONSE"]).optional(),
  notes: z.string().max(2000).optional(),
  callOutcome: z.string().max(500).optional(),
});

export type FollowUpQuery = z.infer<typeof followUpQuerySchema>;
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>;
