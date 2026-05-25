import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(1).max(100),
  employeeId: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Employee ID must be uppercase alphanumeric"),
});

export const updateStaffSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
