import { z } from "zod";
import { paginationQuerySchema } from "./common.schema";

export const getStaffQuerySchema = paginationQuerySchema.extend({
  performance: z.enum(["true", "false"]).optional(),
  storeId: z.string().cuid().optional(),
});

export type GetStaffQuery = z.infer<typeof getStaffQuerySchema>;
