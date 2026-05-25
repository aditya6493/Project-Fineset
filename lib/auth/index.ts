import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { authProviders } from "./providers";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: authProviders,
});

export { isAppSession, getSessionStoreId } from "./auth.config";
