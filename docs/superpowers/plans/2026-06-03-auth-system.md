# Auth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruire proprement le système d'authentification frontend en suivant l'approche canonique better-auth-ui/Next.js.

**Architecture:** Auth client avec tous les plugins actifs → providers.tsx utilisant le wrapper custom AuthProvider → auth pages server components avec notFound() → dashboard layout protégé avec ensureSession + HydrationBoundary.

**Tech Stack:** Next.js 16 App Router, better-auth v1.6, @better-auth-ui/react v1.6.15, @tanstack/react-query v5, bun

---

## Fichiers modifiés

| Fichier                                        | Action                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/frontend/src/lib/auth-client.ts`         | Modifier — ajouter `twoFactorClient()`                                 |
| `apps/frontend/src/components/providers.tsx`   | Modifier — utiliser wrapper custom AuthProvider                        |
| `apps/frontend/src/app/auth/[path]/page.tsx`   | Modifier — `notFound()` au lieu de `redirect()`                        |
| `apps/frontend/src/app/(dashboard)/layout.tsx` | Modifier — server component avec `ensureSession` + `HydrationBoundary` |

---

### Task 1: Ajouter twoFactorClient au auth client

**Files:**

- Modify: `apps/frontend/src/lib/auth-client.ts`

- [ ] **Step 1: Modifier auth-client.ts**

```ts
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
```

- [ ] **Step 2: Vérifier le build TypeScript**

```bash
cd apps/frontend && bun tsc --noEmit
```

Expected: aucune erreur liée à auth-client.ts

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/auth-client.ts
git commit -m "feat(frontend): add twoFactorClient to auth client"
```

---

### Task 2: Fixer providers.tsx

**Files:**

- Modify: `apps/frontend/src/components/providers.tsx`

Context: `providers.tsx` importe `AuthProvider` directement depuis `@better-auth-ui/react` au lieu du wrapper custom `@/components/auth/auth-provider` qui ajoute le `ErrorToaster`. Le `Toaster` doit être à l'extérieur de `AuthProvider`, pas à l'intérieur.

- [ ] **Step 1: Modifier providers.tsx**

```tsx
// src/components/providers.tsx
"use client";

import { organizationPlugin } from "@/lib/auth/organization-plugin";
import { QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  );
}
```

Note: `Toaster` est déplacé hors de `AuthProvider` et le wrapper custom `AuthProvider` (qui inclut `ErrorToaster`) est utilisé.

- [ ] **Step 2: Vérifier le build TypeScript**

```bash
cd apps/frontend && bun tsc --noEmit
```

Expected: aucune erreur

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/providers.tsx
git commit -m "fix(frontend): use custom AuthProvider wrapper, move Toaster outside AuthProvider"
```

---

### Task 3: Fixer auth/[path]/page.tsx

**Files:**

- Modify: `apps/frontend/src/app/auth/[path]/page.tsx`

Context: La page utilise `redirect("/auth/sign-in")` pour les chemins invalides. La bonne pratique Next.js est d'utiliser `notFound()` et d'ajouter `generateStaticParams` pour le prerendering statique.

- [ ] **Step 1: Modifier auth/[path]/page.tsx**

```tsx
import { viewPaths } from "@better-auth-ui/core";
import { notFound } from "next/navigation";
import { Auth } from "@/components/auth/auth";

interface AuthPageProps {
  params: Promise<{ path: string }>;
}

const validPaths = Object.values(viewPaths.auth);

export function generateStaticParams() {
  return validPaths.map((path) => ({ path }));
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;

  if (!validPaths.includes(path as (typeof validPaths)[number])) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Auth path={path} />
    </div>
  );
}
```

- [ ] **Step 2: Vérifier le build TypeScript**

```bash
cd apps/frontend && bun tsc --noEmit
```

Expected: aucune erreur

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/auth/\[path\]/page.tsx
git commit -m "fix(frontend): use notFound() for invalid auth paths"
```

---

### Task 4: Protéger le dashboard layout avec ensureSession

**Files:**

- Modify: `apps/frontend/src/app/(dashboard)/layout.tsx`

Context: Le layout dashboard est un server component. Il doit vérifier la session avec `ensureSession` avant de rendre les enfants. Si pas de session, redirect vers `/auth/sign-in`. `HydrationBoundary` permet aux composants enfants (Header, Sidebar) utilisant `useSession` de ne pas déclencher un fetch client supplémentaire.

- [ ] **Step 1: Modifier (dashboard)/layout.tsx**

```tsx
import { ensureSession } from "@better-auth-ui/react/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getQueryClient } from "@/lib/query-client";
import { Sidebar } from "../../components/sidebar";
import { Header } from "../../components/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const requestHeaders = await headers();

  const session = await ensureSession(queryClient, auth, {
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </HydrationBoundary>
  );
}
```

Note: `auth` doit être importé depuis `@/lib/auth` — vérifier si un re-export existe ou en créer un.

- [ ] **Step 2: Vérifier l'existence du re-export auth côté frontend**

```bash
ls apps/frontend/src/lib/
```

Si `auth.ts` n'existe pas, le créer :

```ts
// apps/frontend/src/lib/auth.ts
export { auth } from "@repo/backend-auth";
```

**ATTENTION**: Le backend est une app NestJS séparée. `auth` du backend NestJS ne peut pas être importé directement dans le frontend Next.js. La bonne approche est d'utiliser `auth.api.getSession` via un appel réseau ou de créer un petit wrapper. Vérifier comment `ensureSession` est conçu: il appelle `auth.api.getSession(params)` avec les headers de la requête.

Puisque le backend est une app séparée, il faut soit:

- (a) Créer un `auth` instance dans le frontend également (duplication de config légère — seulement pour `getSession`)
- (b) Appeler l'API backend directement via `fetch`

Vérifier d'abord si `better-auth` est installé dans le frontend:

```bash
grep "better-auth" apps/frontend/package.json
```

Si `better-auth` est présent, créer `apps/frontend/src/lib/auth.ts` avec une instance minimale.

- [ ] **Step 3: Créer apps/frontend/src/lib/auth.ts si nécessaire**

Vérifier le package.json du frontend — `better-auth` est déjà une dépendance. Créer le fichier :

```ts
// apps/frontend/src/lib/auth.ts
// Minimal auth instance used only for server-side session checks (ensureSession).
// The full auth config lives in apps/backend/src/auth/auth.ts.
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
});
```

**Note importante**: Cette approche crée une instance better-auth minimale dans le frontend uniquement pour permettre à `ensureSession` de faire un appel à `auth.api.getSession`. `auth.api.getSession` avec les headers du request permet à better-auth de résoudre la session via le cookie de session transmis depuis le client. Le baseURL pointe vers le backend NestJS.

Alternativement, si `@repo/db` est accessible depuis le frontend et que la config est partageable, utiliser la même instance. Mais pour une architecture propre, un fetch direct est préférable.

**Alternative plus propre**: Appeler directement l'API backend :

```ts
// apps/frontend/src/lib/auth.ts
// Server-side session check via backend API
export const auth = {
  api: {
    getSession: async ({ headers }: { headers: Headers }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api/auth/get-session`,
        { headers },
      );
      if (!res.ok) return null;
      return res.json();
    },
  },
} as const;
```

Utiliser cette alternative pour éviter de dupliquer la config better-auth.

- [ ] **Step 4: Vérifier le build TypeScript**

```bash
cd apps/frontend && bun tsc --noEmit
```

Expected: aucune erreur

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app/\(dashboard\)/layout.tsx apps/frontend/src/lib/auth.ts
git commit -m "feat(frontend): protect dashboard layout with ensureSession + HydrationBoundary"
```

---

### Task 5: Vérification finale

- [ ] **Step 1: Build complet**

```bash
cd apps/frontend && bun run build
```

Expected: build réussi sans erreurs

- [ ] **Step 2: Lancer le dev server**

```bash
bun run dev
```

Expected: frontend démarre sur port 3002

- [ ] **Step 3: Vérifier les routes**

- `/auth/sign-in` — affiche le formulaire sign-in
- `/auth/sign-up` — affiche le formulaire sign-up
- `/auth/invalid-path` — affiche la page 404
- `/` (dashboard) sans session — redirige vers `/auth/sign-in`
- `/` (dashboard) avec session — affiche le dashboard

- [ ] **Step 4: Commit final si ajustements**

```bash
git add -A
git commit -m "fix(frontend): auth system cleanup"
```
