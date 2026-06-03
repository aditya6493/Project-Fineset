import { z } from "zod";
import { passwordPolicySchema } from "@/lib/auth/password-policy";
import { paginationQuerySchema, periodQuerySchema } from "./common.schema";

const storeCategorySchema = z.enum(["JEWELRY", "HANDBAGS", "WATCHES", "OTHER"]);

export const createStoreSchema = z
  .object({
    name: z.string().min(1).max(100),
    category: storeCategorySchema.default("JEWELRY"),
    customCategory: z.string().min(1).max(100).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    pincode: z
      .string()
      .optional()
      .transform((v) => {
        const trimmed = v?.trim();
        return trimmed ? trimmed : undefined;
      })
      .refine((v) => v === undefined || /^\d{6}$/.test(v), {
        message: "Pincode must be a 6-digit number",
      }),
    pocName: z
      .string()
      .optional()
      .transform((v) => {
        const trimmed = v?.trim();
        return trimmed ? trimmed : undefined;
      }),
    pointOfContactPhone: z
      .string()
      .optional()
      .transform((v) => {
        const trimmed = v?.trim();
        return trimmed ? trimmed : undefined;
      })
      .refine((v) => v === undefined || /^\d{10}$/.test(v), {
        message: "Phone must be a 10-digit number",
      }),
    email: z.string().email().max(255),
    managerPassword: passwordPolicySchema,
  })
  .superRefine((data, ctx) => {
    if (data.category === "OTHER" && !data.customCategory?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom category is required when category is Other",
        path: ["customCategory"],
      });
    }
  });

export const updateStoreSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
  category: storeCategorySchema.optional(),
  customCategory: z.string().min(1).max(100).nullable().optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
});

export const getStoresQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  period: periodQuerySchema.optional(),
  activeOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type GetStoresQuery = z.infer<typeof getStoresQuerySchema>;
