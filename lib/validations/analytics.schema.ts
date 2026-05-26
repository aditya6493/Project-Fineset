import { z } from "zod";
import { paginationQuerySchema, periodQuerySchema } from "./common.schema";

export const getCustomersQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  storeId: z.string().optional(),
});

export const getAnalyticsQuerySchema = z.object({
  period: periodQuerySchema,
  storeId: z.string().optional(),
});

export type GetCustomersQuery = z.infer<typeof getCustomersQuerySchema>;
export type GetAnalyticsQuery = z.infer<typeof getAnalyticsQuerySchema>;
