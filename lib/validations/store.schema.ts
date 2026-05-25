import { z } from "zod";
import { paginationQuerySchema } from "./common.schema";

export const createStoreSchema = z.object({
  name: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

export const updateStoreSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
});

export const getStoresQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  activeOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type GetStoresQuery = z.infer<typeof getStoresQuerySchema>;
