import { passwordPolicySchema } from "@/lib/auth/password-policy";
import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  employeeId: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Employee ID must be uppercase alphanumeric"),
  password: passwordPolicySchema,
});

export const updateStaffSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
