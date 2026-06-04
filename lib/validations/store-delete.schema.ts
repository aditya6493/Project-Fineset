import { z } from "zod";

export const softDeleteStoreSchema = z.object({
  password: z.string().min(1, "Admin password is required"),
  storeNameConfirm: z.string().min(1, "Type the store name to confirm"),
});

export type SoftDeleteStoreInput = z.infer<typeof softDeleteStoreSchema>;
