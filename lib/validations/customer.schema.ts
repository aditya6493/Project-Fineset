import { z } from "zod";

export const getCustomerProfileQuerySchema = z
  .object({
    customerId: z.string().optional(),
    visitId: z.string().optional(),
  })
  .refine((data) => data.customerId || data.visitId, {
    message: "customerId or visitId is required",
  });
