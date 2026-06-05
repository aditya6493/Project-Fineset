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

export const editStaffSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  employeeId: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Employee ID must be uppercase alphanumeric"),
});

export const updateStaffSchema = z
  .object({
    isActive: z.boolean().optional(),
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().max(255).optional(),
    employeeId: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[A-Z0-9]+$/, "Employee ID must be uppercase alphanumeric")
      .optional(),
  })
  .refine(
    (data) =>
      data.isActive !== undefined ||
      data.name !== undefined ||
      data.email !== undefined ||
      data.employeeId !== undefined,
    { message: "At least one field is required" },
  );

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type EditStaffInput = z.infer<typeof editStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
