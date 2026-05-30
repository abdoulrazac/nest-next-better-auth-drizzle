// src/components/providers.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@better-auth-ui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeProvider } from "./theme-provider";
import { TooltipProvider } from "./ui/tooltip";
import { Toaster } from "./ui/sonner";
import { authClient } from "../lib/auth-client";
import { getQueryClient } from "../lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const router = useRouter();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            authClient={authClient as any}
            navigate={({ to, replace }) => {
              if (replace) {
                router.replace(to);
              } else {
                router.push(to);
              }
            }}
            Link={Link}
          >
            {children}
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
