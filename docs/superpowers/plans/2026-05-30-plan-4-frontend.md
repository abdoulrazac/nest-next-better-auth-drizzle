# Plan 4 — Frontend Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer le frontend Next.js barebone en un dashboard complet : pages auth (login, register, forgot-password), shell dashboard (sidebar + header), pages stubs par domaine, protection des routes via Proxy, et setup Playwright.

**Architecture:** Next.js 16 App Router. Auth via `better-auth/client` (createAuthClient). Route protection via `src/proxy.ts` (Next.js 16 — `middleware.ts` est déprécié). Formulaires avec `react-hook-form` + schémas `@repo/validators`. UI via `@repo/ui` (Shadcn). Thème clair/sombre via `next-themes`.

**Note Next.js 16 :** `middleware.ts` est renommé `proxy.ts`, export named `proxy` (pas default). Le matcher utilise la même syntaxe.

**Tech Stack:** Next.js 16, React 19, better-auth/client, react-hook-form, @hookform/resolvers/zod, next-themes, @repo/ui, @repo/validators, lucide-react, Playwright

---

## Fichiers créés ou modifiés

### Setup

- Modifier : `apps/frontend/package.json`
- Modifier : `apps/frontend/src/app/globals.css`
- Modifier : `apps/frontend/src/app/layout.tsx`

### Auth client + Proxy

- Créer : `apps/frontend/src/lib/auth-client.ts`
- Créer : `apps/frontend/src/proxy.ts`

### Auth pages

- Créer : `apps/frontend/src/app/auth/login/page.tsx`
- Créer : `apps/frontend/src/app/auth/register/page.tsx`
- Créer : `apps/frontend/src/app/auth/forgot-password/page.tsx`

### Dashboard shell

- Créer : `apps/frontend/src/app/(dashboard)/layout.tsx`
- Créer : `apps/frontend/src/app/(dashboard)/page.tsx`
- Créer : `apps/frontend/src/components/sidebar.tsx`
- Créer : `apps/frontend/src/components/header.tsx`

### Dashboard pages (stubs)

- Créer : `apps/frontend/src/app/(dashboard)/account/users/page.tsx`
- Créer : `apps/frontend/src/app/(dashboard)/account/roles/page.tsx`
- Créer : `apps/frontend/src/app/(dashboard)/account/audit-logs/page.tsx`
- Créer : `apps/frontend/src/app/(dashboard)/notifications/page.tsx`
- Créer : `apps/frontend/src/app/(dashboard)/files/page.tsx`
- Créer : `apps/frontend/src/app/(dashboard)/settings/page.tsx`
- Créer : `apps/frontend/src/app/(dashboard)/webhooks/page.tsx`

### Playwright

- Créer : `apps/frontend/e2e/playwright.config.ts`
- Créer : `apps/frontend/e2e/auth/login.spec.ts`
- Créer : `apps/frontend/e2e/auth/register.spec.ts`

---

## Task 1 : Dépendances & setup UI

**Files:**

- Modifier : `apps/frontend/package.json`
- Modifier : `apps/frontend/src/app/globals.css`
- Modifier : `apps/frontend/src/app/layout.tsx`

- [ ] **Step 1 : Installer les dépendances**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend
bun add better-auth react-hook-form @hookform/resolvers zod next-themes lucide-react
bun add @repo/ui @repo/validators
```

- [ ] **Step 2 : Remplacer `apps/frontend/src/app/globals.css`**

Le CSS doit définir les variables de thème Shadcn (clair + sombre) et les variables Tailwind. Remplacer par :

```css
@import "tailwindcss";
@import "@repo/ui/styles.css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
  --sidebar-background: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.145 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --sidebar-background: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
}

* {
  border-color: var(--border);
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

Note: If `@repo/ui/styles.css` doesn't exist, remove that import line and keep only `@import "tailwindcss"`.

- [ ] **Step 3 : Réécrire `apps/frontend/src/app/layout.tsx`**

```tsx
// apps/frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend && bunx tsc --noEmit
```

Fix any errors. Common issue: `next-themes` ThemeProvider may need `"use client"` wrapper — if so, create `src/components/theme-provider.tsx`:

```tsx
// src/components/theme-provider.tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

Then import `ThemeProvider` from `"../components/theme-provider"` in `layout.tsx`.

- [ ] **Step 5 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/frontend/
git commit -m "chore(frontend): install deps and setup UI theme"
```

---

## Task 2 : Auth client + Proxy (route protection)

**Files:**

- Créer : `apps/frontend/src/lib/auth-client.ts`
- Créer : `apps/frontend/src/proxy.ts`

- [ ] **Step 1 : Créer `src/lib/auth-client.ts`**

```typescript
// apps/frontend/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  plugins: [adminClient()],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
```

- [ ] **Step 2 : Créer `src/proxy.ts`**

In Next.js 16, `middleware.ts` is deprecated — the file is named `proxy.ts` and exports a named `proxy` function.

```typescript
// apps/frontend/src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/(dashboard)";
const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/forgot-password"];
const SESSION_COOKIE = "better-auth.session_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const isAuthenticated = Boolean(sessionCookie?.value);

  // Redirect unauthenticated users away from protected routes
  const isDashboard =
    pathname === "/" ||
    (!AUTH_PATHS.some((p) => pathname.startsWith(p)) &&
      !pathname.startsWith("/auth"));

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 3 : Ajouter `NEXT_PUBLIC_API_URL` au `.env.local`**

```bash
cat > /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
```

- [ ] **Step 4 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend && bunx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/frontend/src/lib/auth-client.ts apps/frontend/src/proxy.ts apps/frontend/.env.local
git commit -m "feat(frontend): add auth client and route proxy"
```

---

## Task 3 : Pages Auth (login, register, forgot-password)

**Files:**

- Créer : `apps/frontend/src/app/auth/login/page.tsx`
- Créer : `apps/frontend/src/app/auth/register/page.tsx`
- Créer : `apps/frontend/src/app/auth/forgot-password/page.tsx`

Note: Ces pages sont des Client Components (`"use client"`) car elles utilisent react-hook-form.

- [ ] **Step 1 : Créer `src/app/auth/login/page.tsx`**

```tsx
// apps/frontend/src/app/auth/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@repo/validators/auth";
import { signIn } from "../../../lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      setError("root", { message: result.error.message ?? "Login failed" });
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-muted-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Créer `src/app/auth/register/page.tsx`**

```tsx
// apps/frontend/src/app/auth/register/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@repo/validators/auth";
import { signUp } from "../../../lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    const result = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (result.error) {
      setError("root", {
        message: result.error.message ?? "Registration failed",
      });
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Créer `src/app/auth/forgot-password/page.tsx`**

```tsx
// apps/frontend/src/app/auth/forgot-password/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { authClient } from "../../../lib/auth-client";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});
type ForgotInput = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotInput) => {
    const result = await authClient.forgetPassword({
      email: data.email,
      redirectTo: "/auth/reset-password",
    });

    if (result.error) {
      setError("root", {
        message: result.error.message ?? "Failed to send reset email",
      });
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a password
            reset link.
          </p>
          <Link
            href="/auth/login"
            className="text-sm font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Forgot password?
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend && bunx tsc --noEmit
```

Common issues to fix:

- `loginSchema`, `registerSchema` exports from `@repo/validators/auth` — check `packages/validators/src/auth.ts` for exact export names
- `signIn.email`, `signUp.email` are the better-auth client methods — if the API differs, check `node_modules/better-auth/client/index.d.ts`
- `authClient.forgetPassword` — check actual better-auth client API

- [ ] **Step 5 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/frontend/src/app/auth/
git commit -m "feat(frontend): add auth pages (login, register, forgot-password)"
```

---

## Task 4 : Dashboard shell (sidebar + header + layout)

**Files:**

- Créer : `apps/frontend/src/components/sidebar.tsx`
- Créer : `apps/frontend/src/components/header.tsx`
- Créer : `apps/frontend/src/app/(dashboard)/layout.tsx`
- Créer : `apps/frontend/src/app/(dashboard)/page.tsx`
- Modifier : `apps/frontend/src/app/page.tsx` (redirect to dashboard)

- [ ] **Step 1 : Créer `src/components/sidebar.tsx`**

```tsx
// apps/frontend/src/components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ShieldCheck,
  ScrollText,
  Bell,
  FileUp,
  Settings,
  Webhook,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/users", label: "Users", icon: Users },
  { href: "/account/roles", label: "Roles", icon: ShieldCheck },
  { href: "/account/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/files", label: "Files", icon: FileUp },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-sidebar h-screen sticky top-0">
      <div className="px-4 py-5 border-b">
        <span className="text-sm font-semibold tracking-tight">
          Enterprise App
        </span>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2 : Créer `src/components/header.tsx`**

```tsx
// apps/frontend/src/components/header.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "../lib/auth-client";

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
      <div />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        <span className="text-sm text-muted-foreground">
          {session?.user?.name ?? session?.user?.email}
        </span>

        <button
          onClick={handleSignOut}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3 : Créer `src/app/(dashboard)/layout.tsx`**

```tsx
// apps/frontend/src/app/(dashboard)/layout.tsx
import { Sidebar } from "../../components/sidebar";
import { Header } from "../../components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : Créer `src/app/(dashboard)/page.tsx`**

```tsx
// apps/frontend/src/app/(dashboard)/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the Enterprise boilerplate dashboard.
      </p>
    </div>
  );
}
```

- [ ] **Step 5 : Modifier `src/app/page.tsx`** — redirect to dashboard

```tsx
// apps/frontend/src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/");
}
```

Note: Since `/` IS the dashboard (route group `(dashboard)` doesn't add a URL prefix), `src/app/page.tsx` should not exist if `src/app/(dashboard)/page.tsx` exists — they would conflict. **Delete** `src/app/page.tsx` instead.

```bash
rm /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend/src/app/page.tsx
```

- [ ] **Step 6 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend && bunx tsc --noEmit
```

- [ ] **Step 7 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/frontend/src/
git commit -m "feat(frontend): add dashboard shell with sidebar and header"
```

---

## Task 5 : Dashboard pages (stubs)

**Files:** 7 pages stub under `(dashboard)/`

- [ ] **Step 1 : Créer les pages stubs**

Create each file with the following pattern (adjust title per page):

**`src/app/(dashboard)/account/users/page.tsx`**

```tsx
export default function UsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-muted-foreground">Manage users and their roles.</p>
    </div>
  );
}
```

**`src/app/(dashboard)/account/roles/page.tsx`**

```tsx
export default function RolesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Roles</h1>
      <p className="text-muted-foreground">Define roles and permissions.</p>
    </div>
  );
}
```

**`src/app/(dashboard)/account/audit-logs/page.tsx`**

```tsx
export default function AuditLogsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <p className="text-muted-foreground">
        View all actions performed in the system.
      </p>
    </div>
  );
}
```

**`src/app/(dashboard)/notifications/page.tsx`**

```tsx
export default function NotificationsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-muted-foreground">Manage your notifications.</p>
    </div>
  );
}
```

**`src/app/(dashboard)/files/page.tsx`**

```tsx
export default function FilesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Files</h1>
      <p className="text-muted-foreground">Upload and manage files.</p>
    </div>
  );
}
```

**`src/app/(dashboard)/settings/page.tsx`**

```tsx
export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Application and user preferences.</p>
    </div>
  );
}
```

**`src/app/(dashboard)/webhooks/page.tsx`**

```tsx
export default function WebhooksPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Webhooks</h1>
      <p className="text-muted-foreground">Configure outgoing webhooks.</p>
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend && bunx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/frontend/src/app/
git commit -m "feat(frontend): add dashboard stub pages"
```

---

## Task 6 : Playwright e2e setup

**Files:**

- Créer : `apps/frontend/e2e/playwright.config.ts`
- Créer : `apps/frontend/e2e/auth/login.spec.ts`
- Créer : `apps/frontend/e2e/auth/register.spec.ts`

- [ ] **Step 1 : Installer Playwright**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend
bun add -D @playwright/test
```

- [ ] **Step 2 : Créer `e2e/playwright.config.ts`**

```typescript
// apps/frontend/e2e/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3002",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- [ ] **Step 3 : Créer `e2e/auth/login.spec.ts`**

```typescript
// apps/frontend/e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("shows login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows validation errors for empty submit", async ({ page }) => {
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("notauser@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    // Expect either a network error or an auth error message
    await expect(page.getByText(/invalid|failed|incorrect/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("has link to register page", async ({ page }) => {
    await page.getByRole("link", { name: /create one/i }).click();
    await expect(page).toHaveURL("/auth/register");
  });

  test("has link to forgot password page", async ({ page }) => {
    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL("/auth/forgot-password");
  });
});
```

- [ ] **Step 4 : Créer `e2e/auth/register.spec.ts`**

```typescript
// apps/frontend/e2e/auth/register.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Register page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/register");
  });

  test("shows register form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Create account" }),
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
  });

  test("shows validation error for password mismatch", async ({ page }) => {
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("Password1!");
    await page.getByLabel("Confirm password").fill("Different1!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/passwords? do not match/i)).toBeVisible();
  });

  test("has link to login page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/auth/login");
  });
});
```

- [ ] **Step 5 : Ajouter le script `test:e2e` au `package.json`**

Ajouter dans `apps/frontend/package.json` scripts :

```json
"test:e2e": "playwright test --config=e2e/playwright.config.ts"
```

- [ ] **Step 6 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/frontend && bunx tsc --noEmit
```

- [ ] **Step 7 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/frontend/e2e/ apps/frontend/package.json
git commit -m "feat(frontend): add playwright e2e tests for auth flows"
```
