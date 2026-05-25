import type { AppSession } from "@/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: AppSession;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    user: AppSession;
  }
}

export type AuthSession = DefaultSession & {
  user: AppSession;
};
