import { z } from "zod";
import { paginationQuerySchema, periodQuerySchema } from "./common.schema";

const storeCategorySchema = z.enum(["JEWELRY", "HANDBAGS", "WATCHES", "OTHER"]);

export const createStoreSchema = z.object({
  name: z.string().min(1).max(100),
  category: storeCategorySchema.default("JEWELRY"),
  customCategory: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
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
