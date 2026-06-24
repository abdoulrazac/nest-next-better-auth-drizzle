import {
  AuthProvider as AuthProviderPrimitive,
  type AuthProviderProps,
} from "@better-auth-ui/react";
import type { ComponentType, PropsWithChildren } from "react";

import { ErrorToaster } from "./error-toaster";

declare module "@better-auth-ui/core" {
  interface AuthConfig {
    /**
     * React component used to render internal navigation links.
     * Typically TanStack Router's `Link` or Next.js's `Link`.
     */
    Link: ComponentType<
      PropsWithChildren<{ className?: string; href: string; to?: string }>
    >;
  }
}

/**
 * Provides an authentication context by rendering an auth provider with the sonner toast handler injected, forwarding remaining configuration and rendering `children` inside it.
 *
 * @param children - React nodes to render inside the authentication provider
 * @returns A React element that renders an authentication provider configured with the provided props and toast handler
 */
export function AuthProvider({
  children,
  ...config
}: AuthProviderProps): React.JSX.Element {
  return (
    <AuthProviderPrimitive {...config}>
      {children}
      <ErrorToaster />
    </AuthProviderPrimitive>
  );
}
