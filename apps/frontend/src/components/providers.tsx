// src/components/providers.tsx
"use client";

import { env } from "@/env";
import { organizationPlugin } from "@/lib/auth/organization-plugin";
import { captchaPlugin } from "@better-auth-ui/react/plugins";
import { QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { authClient } from "../lib/auth-client";
import { getQueryClient } from "../lib/query-client";
import { AuthProvider } from "./auth/auth-provider";
import { CaptchaWidget } from "./auth/captcha-widget";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { TooltipProvider } from "./ui/tooltip";

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
            <GoogleReCaptchaProvider
              reCaptchaKey={env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            >
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
                plugins={[
                  organizationPlugin(),
                  captchaPlugin({ render: CaptchaWidget }),
                ]}
              >
                {children}
              </AuthProvider>
            </GoogleReCaptchaProvider>

            <Toaster />
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
