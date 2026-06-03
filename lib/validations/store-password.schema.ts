import { z } from "zod";
import { passwordPolicySchema } from "@/lib/auth/password-policy";

export const updateStoreManagerPasswordSchema = z.object({
  password: passwordPolicySchema,
});

export type UpdateStoreManagerPasswordInput = z.infer<
  typeof updateStoreManagerPasswordSchema
>;
