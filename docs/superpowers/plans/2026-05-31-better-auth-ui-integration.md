# better-auth-ui Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hand-rolled auth pages with better-auth-ui pre-built components, wiring up TanStack Query and AuthProvider.

**Architecture:** Install `@tanstack/react-query` and `@better-auth-ui/react`; compose all providers in a single `providers.tsx` client component; replace three individual auth route folders with a single dynamic `app/auth/[path]/page.tsx` powered by the `<Auth />` component from the shadcn registry.

**Tech Stack:** Next.js 16 App Router, better-auth, better-auth-ui (shadcn flavor), @tanstack/react-query, Tailwind CSS v4, shadcn/ui

---

## File Map

| Action | Path                            | Responsibility                                           |
| ------ | ------------------------------- | -------------------------------------------------------- |
| Create | `src/lib/query-client.ts`       | Shared QueryClient factory                               |
| Create | `src/components/providers.tsx`  | All app-level providers composed                         |
| Modify | `src/app/layout.tsx`            | Use `<Providers>` instead of direct `ThemeProvider`      |
| Create | `src/app/auth/[path]/page.tsx`  | Dynamic auth route via `<Auth />`                        |
| Delete | `src/app/auth/login/`           | Replaced by dynamic route                                |
| Delete | `src/app/auth/register/`        | Replaced by dynamic route                                |
| Delete | `src/app/auth/forgot-password/` | Replaced by dynamic route                                |
| Modify | `src/components/header.tsx`     | Update sign-out redirect `/auth/login` → `/auth/sign-in` |

---

## Task 1: Install dependencies

**Files:** none (package installs only)

- [ ] **Step 1: Install npm packages**

Run in `apps/frontend/`:

```bash
npm install @tanstack/react-query @better-auth-ui/react
```

Expected: packages added to `package.json`, no errors.

- [ ] **Step 2: Install Sonner via shadcn CLI**

Run in `apps/frontend/`:

```bash
npx shadcn@latest add sonner
```

Expected: `src/components/ui/sonner.tsx` created.

- [ ] **Step 3: Install better-auth-ui auth components via shadcn registry**

Run in `apps/frontend/`:

```bash
npx shadcn@latest add https://better-auth-ui.com/r/auth.json
```

Expected: auth components added under `src/components/ui/` or `src/components/auth/` (whatever the registry places them).

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: install better-auth-ui and tanstack query deps"
```

---

## Task 2: Create QueryClient factory

**Files:**

- Create: `src/lib/query-client.ts`

- [ ] **Step 1: Create the file**

```ts
// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always return a new client
    return makeQueryClient();
  }
  // Browser: reuse singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npm run check-types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/query-client.ts
git commit -m "feat: add QueryClient factory for better-auth-ui"
```

---

## Task 3: Create Providers component

**Files:**

- Create: `src/components/providers.tsx`

- [ ] **Step 1: Create the file**

```tsx
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
            authClient={authClient}
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npm run check-types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/providers.tsx
git commit -m "feat: add Providers component with AuthProvider and QueryClient"
```

---

## Task 4: Update root layout

**Files:**

- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace ThemeProvider with Providers**

Replace the entire file content with:

```tsx
import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { Providers } from "../components/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enterprise App",
  description: "Enterprise boilerplate dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", inter.variable)}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npm run check-types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: use Providers wrapper in root layout"
```

---

## Task 5: Create dynamic auth route

**Files:**

- Create: `src/app/auth/[path]/page.tsx`

- [ ] **Step 1: Create the dynamic page**

```tsx
// src/app/auth/[path]/page.tsx
import { Auth, viewPaths } from "@/components/auth/auth";
import { redirect } from "next/navigation";

interface AuthPageProps {
  params: Promise<{ path: string }>;
}

export function generateStaticParams() {
  return Object.values(viewPaths.auth).map((path) => ({ path }));
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;

  if (!Object.values(viewPaths.auth).includes(path as never)) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Auth pathname={`/auth/${path}`} />
    </div>
  );
}
```

> Note: The exact import path for `Auth` and `viewPaths` depends on where `npx shadcn add` places the components. Check `src/components/` after Task 1 and adjust the import if needed (e.g. `@/components/ui/auth` or `@/components/auth`).

- [ ] **Step 2: Verify TypeScript**

```bash
npm run check-types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/[path]/page.tsx
git commit -m "feat: add dynamic auth route using better-auth-ui Auth component"
```

---

## Task 6: Remove old auth pages and update internal links

**Files:**

- Delete: `src/app/auth/login/`
- Delete: `src/app/auth/register/`
- Delete: `src/app/auth/forgot-password/`
- Modify: `src/components/header.tsx`

- [ ] **Step 1: Delete old auth page folders**

```bash
rm -rf src/app/auth/login src/app/auth/register src/app/auth/forgot-password
```

- [ ] **Step 2: Update header.tsx sign-out redirect**

In `src/components/header.tsx`, change line 16:

```ts
// Before
router.push("/auth/login");

// After
router.push("/auth/sign-in");
```

- [ ] **Step 3: Verify TypeScript and lint**

```bash
npm run check-types && npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove old auth pages, update links to new paths"
```

---

## Task 7: Smoke test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify each route loads**

| URL                                          | Expected                     |
| -------------------------------------------- | ---------------------------- |
| `http://localhost:3002/auth/sign-in`         | Sign-in form renders         |
| `http://localhost:3002/auth/sign-up`         | Sign-up form renders         |
| `http://localhost:3002/auth/forgot-password` | Forgot password form renders |
| `http://localhost:3002/auth/reset-password`  | Reset password form renders  |
| `http://localhost:3002/auth/sign-out`        | Sign-out screen / redirect   |
| `http://localhost:3002/auth/login`           | Redirects to `/auth/sign-in` |

- [ ] **Step 3: Test sign-in and sign-up flows end-to-end manually**

- [ ] **Step 4: Final commit if any fixups were made**

```bash
git add -A
git commit -m "fix: post-integration fixups"
```
