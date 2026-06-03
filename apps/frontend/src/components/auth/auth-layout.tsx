"use client";

import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  view: "sign-in" | "sign-up";
}

const QUOTES = {
  "sign-in": {
    text: "Managing your enterprise has never been this effortless. Everything you need, right at your fingertips.",
    author: "Enterprise Platform",
  },
  "sign-up": {
    text: "Join thousands of teams that trust our platform to power their operations — securely and efficiently.",
    author: "Enterprise Platform",
  },
};

export function AuthLayout({ children, view }: AuthLayoutProps) {
  const quote = QUOTES[view];

  return (
    <div className="container relative min-h-svh flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left panel — dark branded side */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />

        {/* Logo */}
        <div className="relative z-20 flex items-center gap-2 text-lg font-semibold">
          <AppLogo />
          <span>Enterprise App</span>
        </div>

        {/* Decorative grid / pattern */}
        <div className="relative z-20 flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-sm">
            {/* Decorative cards stacked */}
            <div className="absolute -top-4 -left-4 h-64 w-64 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm" />
            <div className="absolute -bottom-4 -right-4 h-64 w-64 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm" />
            <div className="relative rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm p-6 shadow-2xl">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20" />
                  <div className="space-y-1">
                    <div className="h-2 w-24 rounded bg-white/40" />
                    <div className="h-2 w-16 rounded bg-white/20" />
                  </div>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="h-2 w-full rounded bg-white/20" />
                  <div className="h-2 w-4/5 rounded bg-white/20" />
                  <div className="h-2 w-3/5 rounded bg-white/20" />
                </div>
                <div className="flex gap-2 pt-1">
                  <div className="h-5 w-16 rounded-full bg-emerald-400/40 border border-emerald-400/20" />
                  <div className="h-5 w-12 rounded-full bg-blue-400/40 border border-blue-400/20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">{quote.author}</footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 lg:hidden">
            <AppLogo className="text-foreground" />
            <span className="text-lg font-semibold">Enterprise App</span>
          </div>

          {children}

          <p className="px-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${className ?? "text-white"}`}
    >
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  );
}
