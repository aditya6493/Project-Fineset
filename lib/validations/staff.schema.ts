import { passwordPolicySchema } from "@/lib/auth/password-policy";
import { phoneSchema } from "@/lib/validations/common.schema";
import { z } from "zod";

export const staffMemberRoleSchema = z.enum(["STORE_MANAGER", "STAFF"]);

export const createStaffSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  employeeId: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Employee ID must be uppercase alphanumeric"),
  role: staffMemberRoleSchema,
  phone: phoneSchema,
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
  role: staffMemberRoleSchema,
  phone: phoneSchema,
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
    role: staffMemberRoleSchema.optional(),
    phone: phoneSchema.optional(),
  })
  .refine(
    (data) =>
      data.isActive !== undefined ||
      data.name !== undefined ||
      data.email !== undefined ||
      data.employeeId !== undefined ||
      data.role !== undefined ||
      data.phone !== undefined,
    { message: "At least one field is required" },
  );

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type EditStaffInput = z.infer<typeof editStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
