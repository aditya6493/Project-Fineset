import { z } from "zod";
import { paginationQuerySchema } from "./common.schema";
import {
  staffCallQueueSchema,
  staffCallSegmentSchema,
  staffCallValueTierSchema,
} from "./staff-calls.schema";

export const portalCallsQuerySchema = paginationQuerySchema.extend({
  segment: staffCallSegmentSchema.default("ALL"),
  valueTier: staffCallValueTierSchema.default("ALL"),
  queue: staffCallQueueSchema.default("ALL"),
  year: z.coerce
    .number()
    .int()
    .min(2020)
    .max(2100)
    .default(() => new Date().getFullYear()),
  month: z.coerce
    .number()
    .int()
    .min(1)
    .max(12)
    .default(() => new Date().getMonth() + 1),
  storeId: z.string().optional(),
  staffId: z.string().optional(),
  search: z.string().optional(),
  intentTier: z.enum(["HOT", "WARM", "COLD", "BROWSING"]).optional(),
});

export type PortalCallsQuery = z.infer<typeof portalCallsQuerySchema>;
