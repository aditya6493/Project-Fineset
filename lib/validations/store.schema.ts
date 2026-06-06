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
      .transform((v) => v.trim())
      .refine((v) => v === "" || /^\d{6}$/.test(v), {
        message: "Pincode must be a 6-digit number",
      })
      .transform((v) => (v === "" ? undefined : v)),
    businessOwnerName: z.string().min(1).max(100).transform((v) => v.trim()),
    businessOwnerEmail: z
      .string()
      .transform((v) => v.trim())
      .refine((v) => v === "" || z.string().email().safeParse(v).success, {
        message: "Enter a valid email address",
      })
      .transform((v) => (v === "" ? undefined : v)),
    password: z
      .string()
      .transform((v) => v.trim())
      .transform((v) => (v === "" ? undefined : v))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "OTHER" && !data.customCategory?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom category is required when category is Other",
        path: ["customCategory"],
      });
    }
    if (data.password) {
      const passwordCheck = passwordPolicySchema.safeParse(data.password);
      if (!passwordCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: passwordCheck.error.issues[0]?.message ?? "Invalid password",
          path: ["password"],
        });
      }
      if (!data.businessOwnerEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Business owner email is required when setting a password",
          path: ["businessOwnerEmail"],
        });
      }
    }
  });

export const editStoreSchema = z.object({
  name: z.string().min(1).max(100),
  category: storeCategorySchema,
  customCategory: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v === "" || /^\d{6}$/.test(v), {
      message: "Pincode must be a 6-digit number",
    })
    .transform((v) => (v === "" ? undefined : v)),
  businessOwnerName: z.string().min(1).max(100).transform((v) => v.trim()),
  businessOwnerEmail: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Enter a valid email address",
    })
    .transform((v) => (v === "" ? undefined : v)),
});

export type EditStoreInput = z.infer<typeof editStoreSchema>;

export const updateStoreSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
  category: storeCategorySchema.optional(),
  customCategory: z.string().min(1).max(100).nullable().optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be a 6-digit number")
    .nullable()
    .optional(),
  businessOwnerName: z.string().min(1).max(100).nullable().optional(),
  businessOwnerEmail: z.string().email().max(255).nullable().optional(),
});

export const getStoresQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  period: periodQuerySchema.optional(),
  activeOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type GetStoresQuery = z.infer<typeof getStoresQuerySchema>;
