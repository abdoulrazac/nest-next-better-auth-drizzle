// src/components/providers.tsx
"use client";

import { organizationPlugin } from "@/lib/auth/organization-plugin";
import { QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "./theme-provider";
import { TooltipProvider } from "./ui/tooltip";
import { Toaster } from "./ui/sonner";
import { AuthProvider } from "./auth/auth-provider";
import { authClient } from "../lib/auth-client";
import { getQueryClient } from "../lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const router = useRouter();

  return (
    <NuqsAdapter>
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
              plugins={[organizationPlugin()]}
            >
              {children}
            </AuthProvider>

            <Toaster />
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
