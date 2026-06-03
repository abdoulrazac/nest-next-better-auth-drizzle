import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  plugins: [adminClient(), organizationClient(), twoFactorClient()],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
