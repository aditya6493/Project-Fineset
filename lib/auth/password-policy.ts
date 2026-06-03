import { z } from "zod";

export const passwordPolicySchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must include a special character",
  );

export function validatePassword(password: string): {
  success: boolean;
  error?: string;
} {
  const result = passwordPolicySchema.safeParse(password);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message };
  }
  return { success: true };
}
