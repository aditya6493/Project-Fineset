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

export const getInsightsQuerySchema = z.object({
  period: periodQuerySchema,
  storeId: z.string().optional(),
  context: z.enum(["store", "admin"]),
});

export type GetCustomersQuery = z.infer<typeof getCustomersQuerySchema>;
export type GetAnalyticsQuery = z.infer<typeof getAnalyticsQuerySchema>;
export type GetInsightsQuery = z.infer<typeof getInsightsQuerySchema>;
