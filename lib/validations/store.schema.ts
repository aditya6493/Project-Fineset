import { z } from "zod";
import { paginationQuerySchema, periodQuerySchema } from "./common.schema";

const storeCategorySchema = z.enum(["JEWELRY", "HANDBAGS", "WATCHES", "OTHER"]);

export const createStoreSchema = z.object({
  name: z.string().min(1).max(100),
  category: storeCategorySchema.default("JEWELRY"),
  customCategory: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be a 6-digit number"),
  pocName: z.string().min(2).max(100),
  pointOfContactPhone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid contact number"),
  email: z.string().email(),
}).superRefine((value, ctx) => {
  if (value.category === "OTHER" && !value.customCategory?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customCategory"],
      message: "Please enter a custom category when selecting Other",
    });
  }
});

export const updateStoreSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
  category: storeCategorySchema.optional(),
  customCategory: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be a 6-digit number")
    .optional(),
  pocName: z.string().min(2).max(100).optional(),
  pointOfContactPhone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid contact number")
    .optional(),
  email: z.string().email().optional(),
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
