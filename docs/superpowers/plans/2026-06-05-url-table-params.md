# URL Table Params Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchroniser search, filtres et pagination des pages liste avec l'URL via `nuqs` pour permettre la navigation retour/avant et le partage d'URL.

**Architecture:** Un hook générique `useTableParams` encapsule `nuqs/useQueryStates`. Le `TableHeader` reçoit un champ recherche submit-on-Enter/bouton (state local de frappe, `onSearch` appelé à la validation). Chaque feature remplace ses `useState` de table par ce hook.

**Tech Stack:** `nuqs` v2, Next.js App Router (`NuqsAdapter`), React `useEffect`/`useState` pour l'input local.

---

## Fichiers touchés

| Fichier                                                  | Action                           |
| -------------------------------------------------------- | -------------------------------- |
| `apps/frontend/package.json`                             | Modifier — ajouter `nuqs`        |
| `apps/frontend/src/components/providers.tsx`             | Modifier — ajouter `NuqsAdapter` |
| `apps/frontend/src/hooks/use-table-params.ts`            | **Créer**                        |
| `apps/frontend/src/components/table-header.tsx`          | Modifier — interface + UI search |
| `apps/frontend/src/features/showcase/products/hooks.tsx` | Migrer                           |
| `apps/frontend/src/features/users/index.tsx`             | Migrer                           |
| `apps/frontend/src/features/roles/index.tsx`             | Migrer                           |

---

## Task 1 : Installer nuqs

**Files:**

- Modify: `apps/frontend/package.json`

- [ ] **Step 1 : Installer nuqs dans le workspace frontend**

```bash
npm install nuqs --workspace=apps/frontend
```

- [ ] **Step 2 : Vérifier que nuqs est dans les dépendances**

```bash
grep nuqs apps/frontend/package.json
```

Expected output (version peut varier) :

```
"nuqs": "^2.x.x"
```

- [ ] **Step 3 : Commit**

```bash
git add apps/frontend/package.json package-lock.json
git commit -m "chore(frontend): install nuqs for URL state management"
```

---

## Task 2 : Ajouter NuqsAdapter dans providers.tsx

**Files:**

- Modify: `apps/frontend/src/components/providers.tsx`

- [ ] **Step 1 : Mettre à jour providers.tsx**

Remplacer le contenu complet de `apps/frontend/src/components/providers.tsx` par :

```tsx
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
```

- [ ] **Step 2 : Vérifier la compilation**

```bash
npx tsc --noEmit -p apps/frontend/tsconfig.json 2>&1 | grep -v "messaging\|supertest"
```

Expected : aucune erreur liée à `providers.tsx`.

- [ ] **Step 3 : Commit**

```bash
git add apps/frontend/src/components/providers.tsx
git commit -m "feat(frontend): add NuqsAdapter to providers"
```

---

## Task 3 : Créer le hook `useTableParams`

**Files:**

- Create: `apps/frontend/src/hooks/use-table-params.ts`

- [ ] **Step 1 : Créer le fichier `apps/frontend/src/hooks/use-table-params.ts`**

```ts
"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export interface TableParamsConfig {
  /** Clés URL pour les filtres discrets (ex: ["status", "category"]) */
  filterKeys?: string[];
  /** Taille de page par défaut. Défaut : 10 */
  defaultPageSize?: number;
}

/**
 * Hook générique qui synchronise search, filtres et pagination avec l'URL.
 *
 * - Tous les changements utilisent `history: 'push'` (navigation complète).
 * - `setSearch`, `setFilter` et `setPageSize` remettent automatiquement `page` à 1.
 * - Les valeurs absentes de l'URL retournent leur défaut ("" ou 1 ou defaultPageSize).
 * - Passer `null` à nuqs supprime le paramètre de l'URL.
 */
export function useTableParams(config?: TableParamsConfig) {
  const filterKeys = config?.filterKeys ?? [];
  const defaultPageSize = config?.defaultPageSize ?? 10;

  const parsers = {
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(defaultPageSize),
    ...Object.fromEntries(
      filterKeys.map((k) => [k, parseAsString.withDefault("")]),
    ),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [params, setParams] = useQueryStates(parsers as any, {
    history: "push",
  });

  // Cast vers un type indexable pour accéder aux clés dynamiques
  const p = params as {
    search: string;
    page: number;
    pageSize: number;
    [key: string]: string | number;
  };

  return {
    // ── Recherche ────────────────────────────────────────────────────────────
    /** Valeur soumise (URL) */
    search: p.search,
    /** Mettre à jour la recherche et remettre page à 1 */
    setSearch: (value: string) =>
      void setParams({ search: value || null, page: 1 }),

    // ── Filtres ──────────────────────────────────────────────────────────────
    /** Lire la valeur d'un filtre (retourne "" si absent) */
    getFilter: (key: string): string => String(p[key] ?? ""),
    /** Mettre à jour un filtre et remettre page à 1 */
    setFilter: (key: string, value: string) =>
      void setParams({ [key]: value || null, page: 1 }),

    // ── Pagination ───────────────────────────────────────────────────────────
    page: p.page,
    setPage: (page: number) => void setParams({ page }),

    pageSize: p.pageSize,
    /** Changer la taille de page et remettre page à 1 */
    setPageSize: (size: number) => void setParams({ pageSize: size, page: 1 }),

    // ── Reset ────────────────────────────────────────────────────────────────
    /** Effacer search + tous les filtres + remettre page à 1 */
    resetFilters: () =>
      void setParams({
        search: null,
        page: null,
        ...Object.fromEntries(filterKeys.map((k) => [k, null])),
      }),
  };
}
```

- [ ] **Step 2 : Vérifier la compilation**

```bash
npx tsc --noEmit -p apps/frontend/tsconfig.json 2>&1 | grep "use-table-params"
```

Expected : aucune sortie (aucune erreur dans ce fichier).

- [ ] **Step 3 : Commit**

```bash
git add apps/frontend/src/hooks/use-table-params.ts
git commit -m "feat(frontend): add useTableParams hook with nuqs URL sync"
```

---

## Task 4 : Modifier `table-header.tsx` — champ recherche avec submit

**Files:**

- Modify: `apps/frontend/src/components/table-header.tsx`

- [ ] **Step 1 : Remplacer le contenu complet de `apps/frontend/src/components/table-header.tsx`**

```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshIcon, SearchIcon, XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState, type ReactNode } from "react";

// ── Types ───────────────────────────────────────────────────────────────────────

export interface SearchField {
  /** Valeur commitée (depuis l'URL). L'input se resynchronise dessus. */
  value: string;
  /** Appelé uniquement sur Enter ou clic du bouton loupe. */
  onSearch: (v: string) => void;
  placeholder?: string;
}

export interface FilterField {
  id: string;
  component: ReactNode;
}

export interface ActionButton {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  tooltip?: string;
}

export interface BulkAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export interface BulkActionsConfig {
  selectedCount: number;
  countLabel?: string;
  onClose: () => void;
  actions: BulkAction[];
}

interface TableHeaderProps {
  search?: SearchField;
  filters?: FilterField[];
  actions?: ActionButton[];
  bulkActions?: BulkActionsConfig;
  extra?: ReactNode;
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

// ── SearchInput ─────────────────────────────────────────────────────────────────

/**
 * Input avec bouton loupe. State local pour la frappe ; onSearch n'est
 * appelé que sur Enter ou clic du bouton. Se resynchronise avec `value`
 * lors de la navigation retour/avant.
 */
function SearchInput({ search }: { search: SearchField }) {
  const [localValue, setLocalValue] = useState(search.value);

  // Resync quand l'URL change (navigation retour/avant)
  useEffect(() => {
    setLocalValue(search.value);
  }, [search.value]);

  const handleSubmit = () => search.onSearch(localValue);

  return (
    <div className="flex flex-1 min-w-50 max-w-sm">
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        placeholder={search.placeholder ?? "Rechercher..."}
        className="rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button
        variant="outline"
        size="icon"
        type="button"
        onClick={handleSubmit}
        className="rounded-l-none border-l-0 shrink-0"
      >
        <HugeiconsIcon icon={SearchIcon} className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TableHeader({
  search,
  filters,
  actions,
  bulkActions,
  extra,
  spacing = "md",
  className,
}: TableHeaderProps) {
  const isBulk = bulkActions && bulkActions.selectedCount > 0;

  const gapClass = { sm: "gap-2", md: "gap-3", lg: "gap-4" }[spacing];

  if (isBulk) {
    return (
      <div
        className={cn(
          "flex items-center rounded-lg border bg-muted/50 px-3 py-2",
          gapClass,
          className,
        )}
      >
        <Badge variant="secondary" className="shrink-0">
          {bulkActions.selectedCount}{" "}
          {bulkActions.countLabel ?? "sélectionné(s)"}
        </Badge>
        <div className="flex flex-1 items-center gap-2">
          {bulkActions.actions.map((a, i) => (
            <Button
              key={i}
              variant={a.variant === "destructive" ? "destructive" : "outline"}
              size="sm"
              onClick={a.onClick}
            >
              {a.icon}
              {a.label}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={bulkActions.onClose}>
          <HugeiconsIcon icon={XIcon} className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center", gapClass, className)}>
      {search && <SearchInput search={search} />}
      {filters?.map((f) => (
        <div key={f.id}>{f.component}</div>
      ))}
      {actions?.map((a, i) => (
        <Button key={i} variant={a.variant ?? "outline"} onClick={a.onClick}>
          {a.icon}
          {a.label}
        </Button>
      ))}
      {extra && <div className="ml-auto">{extra}</div>}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function createSearchField(
  value: string,
  onSearch: (v: string) => void,
  opts?: { placeholder?: string },
): SearchField {
  return { value, onSearch, placeholder: opts?.placeholder };
}

export function createFilterField(
  id: string,
  component: ReactNode,
): FilterField {
  return { id, component };
}

export function createResetButton(
  onClick: () => void,
  opts?: { label?: string },
): ActionButton {
  return {
    label: opts?.label ?? "Réinitialiser",
    icon: <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />,
    onClick,
    variant: "ghost",
  };
}

export function createBulkActions(
  selectedCount: number,
  actions: BulkAction[],
  opts?: { countLabel?: string; onClose?: () => void },
): BulkActionsConfig {
  return {
    selectedCount,
    countLabel: opts?.countLabel,
    onClose: opts?.onClose ?? (() => {}),
    actions,
  };
}
```

- [ ] **Step 2 : Vérifier la compilation**

```bash
npx tsc --noEmit -p apps/frontend/tsconfig.json 2>&1 | grep -v "messaging\|supertest"
```

Expected : des erreurs dans les 3 features (elles utilisent encore l'ancien `onChange`) — c'est normal, elles seront corrigées dans les tasks suivantes. Aucune erreur dans `table-header.tsx` lui-même.

- [ ] **Step 3 : Commit**

```bash
git add apps/frontend/src/components/table-header.tsx
git commit -m "feat(frontend): update TableHeader search to submit-on-Enter/button pattern"
```

---

## Task 5 : Migrer `features/showcase/products/hooks.tsx`

**Files:**

- Modify: `apps/frontend/src/features/showcase/products/hooks.tsx`

- [ ] **Step 1 : Remplacer la section state + config de `useProducts`**

Dans `apps/frontend/src/features/showcase/products/hooks.tsx` :

**a) Ajouter l'import en haut du fichier :**

```ts
import { useTableParams } from "@/hooks/use-table-params";
```

**b) Supprimer l'import `useState` de react** (ou retirer les 5 variables qu'on remplace — `selectedItems` et `selectedId` restent en `useState`) :

```ts
// Avant
import { useMemo, useState } from "react";

// Après — useState reste pour selectedItems et selectedId
import { useMemo, useState } from "react";
```

`useState` reste car `selectedItems` et `selectedId` ne vont pas dans l'URL.

**c) Remplacer les 5 `useState` de table par `useTableParams` :**

```ts
// Supprimer ces lignes :
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [categoryFilter, setCategoryFilter] = useState("");

// Les remplacer par :
const {
  search,
  setSearch,
  getFilter,
  setFilter,
  page,
  setPage,
  pageSize,
  setPageSize,
  resetFilters,
} = useTableParams({ filterKeys: ["status", "category"] });
```

**d) Mettre à jour la `queryKey` et la `queryFn` :**

```ts
// Avant
queryKey: productKeys.list({ page, pageSize, searchTerm, statusFilter, categoryFilter }),
queryFn: async () => {
  // ...
  const filtered = all.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q);
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });
  // ...
}

// Après
queryKey: productKeys.list({
  page,
  pageSize,
  search,
  status: getFilter("status"),
  category: getFilter("category"),
}),
queryFn: async () => {
  await new Promise((r) => setTimeout(r, 200));
  const all = mockStore.getProducts();
  const q = search.toLowerCase();
  const statusVal = getFilter("status");
  const categoryVal = getFilter("category");
  const filtered = all.filter((p) => {
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q);
    const matchStatus = !statusVal || p.status === statusVal;
    const matchCategory = !categoryVal || p.category === categoryVal;
    return matchSearch && matchStatus && matchCategory;
  });
  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);
  return { items, total };
},
```

**e) Mettre à jour `searchConfig` :**

```ts
// Avant
const searchConfig = createSearchField(
  searchTerm,
  (v) => {
    setSearchTerm(v);
    setPage(1);
  },
  { placeholder: "Rechercher un produit..." },
);

// Après
const searchConfig = createSearchField(search, setSearch, {
  placeholder: "Rechercher un produit...",
});
```

**f) Mettre à jour les filtres (toggle status et category) :**

```ts
// Avant
createFilterField(
  "status",
  <SingleSelect
    value={statusFilter}
    onValueChange={(v) => { setStatusFilter((p) => (p == v ? "" : v)); setPage(1); }}
    // ...
  />,
),
createFilterField(
  "category",
  <SingleSelect
    value={categoryFilter}
    onValueChange={(v) => { setCategoryFilter((p) => (p == v ? "" : v)); setPage(1); }}
    // ...
  />,
),

// Après
createFilterField(
  "status",
  <SingleSelect
    value={getFilter("status")}
    onValueChange={(v) =>
      setFilter("status", getFilter("status") === v ? "" : v)
    }
    options={[
      { value: "ACTIVE", label: "Actif" },
      { value: "INACTIVE", label: "Inactif" },
      { value: "DRAFT", label: "Brouillon" },
      { value: "OUT_OF_STOCK", label: "Rupture" },
    ]}
    placeholder="Statut"
    btnClassName="min-w-32"
  />,
),
createFilterField(
  "category",
  <SingleSelect
    value={getFilter("category")}
    onValueChange={(v) =>
      setFilter("category", getFilter("category") === v ? "" : v)
    }
    options={[
      { value: "Électronique", label: "Électronique" },
      { value: "Vêtements", label: "Vêtements" },
      { value: "Alimentation", label: "Alimentation" },
      { value: "Mobilier", label: "Mobilier" },
    ]}
    placeholder="Catégorie"
    btnClassName="min-w-36"
  />,
),
```

**g) Mettre à jour `actionsConfig` :**

```ts
// Avant
const actionsConfig = [
  createResetButton(() => {
    setSearchTerm("");
    setStatusFilter("");
    setCategoryFilter("");
    setPage(1);
  }),
];

// Après
const actionsConfig = [createResetButton(resetFilters)];
```

- [ ] **Step 2 : Vérifier la compilation (seulement products)**

```bash
npx tsc --noEmit -p apps/frontend/tsconfig.json 2>&1 | grep "products"
```

Expected : aucune erreur dans les fichiers products.

- [ ] **Step 3 : Commit**

```bash
git add apps/frontend/src/features/showcase/products/hooks.tsx
git commit -m "feat(showcase/products): migrate table state to useTableParams URL sync"
```

---

## Task 6 : Migrer `features/users/index.tsx`

**Files:**

- Modify: `apps/frontend/src/features/users/index.tsx`

- [ ] **Step 1 : Ajouter l'import de `useTableParams`**

```ts
import { useTableParams } from "@/hooks/use-table-params";
```

- [ ] **Step 2 : Remplacer les 4 `useState` de table dans `UsersPage`**

```ts
// Supprimer :
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

// Remplacer par :
const {
  search,
  setSearch,
  getFilter,
  setFilter,
  page,
  setPage,
  pageSize,
  setPageSize,
  resetFilters,
} = useTableParams({ filterKeys: ["status"] });
```

Les autres `useState` (`dialogOpen`, `editTarget`, `selectedId`, `selectedItems`) restent inchangés.

- [ ] **Step 3 : Mettre à jour `useListUsers`**

```ts
// Avant
const { data, isLoading } = useListUsers({
  page,
  pageSize,
  search: search || undefined,
  status: statusFilter || undefined,
});

// Après
const { data, isLoading } = useListUsers({
  page,
  pageSize,
  search: search || undefined,
  status: getFilter("status") || undefined,
});
```

- [ ] **Step 4 : Mettre à jour `searchConfig`**

```ts
// Avant
const searchConfig = createSearchField(
  search,
  (v) => {
    setSearch(v);
    setPage(1);
  },
  { placeholder: "Rechercher un utilisateur..." },
);

// Après
const searchConfig = createSearchField(search, setSearch, {
  placeholder: "Rechercher un utilisateur...",
});
```

- [ ] **Step 5 : Mettre à jour `filtersConfig`**

```tsx
// Avant
const filtersConfig = [
  createFilterField(
    "status",
    <SingleSelect
      value={statusFilter}
      onValueChange={(v) => {
        setStatusFilter(v);
        setPage(1);
      }}
      options={STATUS_OPTIONS}
      placeholder="Statut"
      btnClassName="min-w-32"
    />,
  ),
];

// Après
const filtersConfig = [
  createFilterField(
    "status",
    <SingleSelect
      value={getFilter("status")}
      onValueChange={(v) => setFilter("status", v)}
      options={STATUS_OPTIONS}
      placeholder="Statut"
      btnClassName="min-w-32"
    />,
  ),
];
```

- [ ] **Step 6 : Mettre à jour `actionsConfig`**

```ts
// Avant
const actionsConfig = [
  createResetButton(() => {
    setSearch("");
    setStatusFilter("");
    setPage(1);
  }),
];

// Après
const actionsConfig = [createResetButton(resetFilters)];
```

- [ ] **Step 7 : Mettre à jour le `onPageSizeChange` de `<Pagination>`**

```tsx
// Avant
onPageSizeChange={(s) => {
  setPageSize(s);
  setPage(1);
}}

// Après
onPageSizeChange={setPageSize}
```

(`setPageSize` de `useTableParams` remet déjà page à 1.)

- [ ] **Step 8 : Nettoyer les imports inutilisés**

Vérifier que `useState` est toujours importé (il l'est pour les 4 états restants). Supprimer uniquement les imports qui ne sont plus référencés.

- [ ] **Step 9 : Vérifier la compilation**

```bash
npx tsc --noEmit -p apps/frontend/tsconfig.json 2>&1 | grep "users"
```

Expected : aucune erreur dans les fichiers users.

- [ ] **Step 10 : Commit**

```bash
git add apps/frontend/src/features/users/index.tsx
git commit -m "feat(users): migrate table state to useTableParams URL sync"
```

---

## Task 7 : Migrer `features/roles/index.tsx`

**Files:**

- Modify: `apps/frontend/src/features/roles/index.tsx`

- [ ] **Step 1 : Ajouter l'import de `useTableParams`**

```ts
import { useTableParams } from "@/hooks/use-table-params";
```

- [ ] **Step 2 : Remplacer les 2 `useState` de table**

```ts
// Supprimer :
const PAGE_SIZE = 10;
const [search, setSearch] = useState("");
const [page, setPage] = useState(1);

// Remplacer par :
const {
  search,
  setSearch,
  page,
  setPage,
  pageSize,
  setPageSize,
  resetFilters,
} = useTableParams({ defaultPageSize: 10 });
```

- [ ] **Step 3 : Mettre à jour la pagination client-side**

```ts
// Avant
const total = allItems.length;
const pagedItems = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

// Après
const total = allItems.length;
const pagedItems = allItems.slice((page - 1) * pageSize, page * pageSize);
```

- [ ] **Step 4 : Mettre à jour `searchConfig`**

```ts
// Avant
const searchConfig = createSearchField(
  search,
  (v) => {
    setSearch(v);
    setPage(1);
  },
  { placeholder: "Rechercher un rôle..." },
);

// Après
const searchConfig = createSearchField(search, setSearch, {
  placeholder: "Rechercher un rôle...",
});
```

- [ ] **Step 5 : Mettre à jour `actionsConfig`**

```ts
// Avant
const actionsConfig = [
  createResetButton(() => {
    setSearch("");
    setPage(1);
  }),
];

// Après
const actionsConfig = [createResetButton(resetFilters)];
```

- [ ] **Step 6 : Mettre à jour `<Pagination>`**

```tsx
// Avant
{
  total > PAGE_SIZE && (
    <Pagination
      currentPage={page}
      totalPages={Math.ceil(total / PAGE_SIZE)}
      pageSize={PAGE_SIZE}
      totalCount={total}
      onPageChange={setPage}
      onPageSizeChange={() => setPage(1)}
    />
  );
}

// Après
{
  total > pageSize && (
    <Pagination
      currentPage={page}
      totalPages={Math.ceil(total / pageSize)}
      pageSize={pageSize}
      totalCount={total}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
    />
  );
}
```

- [ ] **Step 7 : Nettoyer les imports**

Retirer `useState` si plus utilisé (vérifier que `selectedItems` et `selectedId` l'utilisent encore — ils le font, donc `useState` reste).

- [ ] **Step 8 : Vérifier la compilation**

```bash
npx tsc --noEmit -p apps/frontend/tsconfig.json 2>&1 | grep "roles"
```

Expected : aucune erreur dans les fichiers roles.

- [ ] **Step 9 : Commit**

```bash
git add apps/frontend/src/features/roles/index.tsx
git commit -m "feat(roles): migrate table state to useTableParams URL sync"
```

---

## Task 8 : Vérification finale

- [ ] **Step 1 : Compilation TypeScript complète frontend**

```bash
npx tsc --noEmit -p apps/frontend/tsconfig.json 2>&1 | grep -v "messaging\|supertest"
```

Expected : aucune sortie (aucune erreur dans le code qu'on a touché).

- [ ] **Step 2 : Vérifier le comportement URL dans le navigateur**

Naviguer vers `/showcase/products`, taper "laptop" dans la recherche et soumettre.

Expected dans la barre d'adresse :

```
/showcase/products?search=laptop
```

Sélectionner le filtre "Actif" :

```
/showcase/products?search=laptop&status=ACTIVE
```

Passer en page 2 :

```
/showcase/products?search=laptop&status=ACTIVE&page=2
```

Cliquer Retour → revenir à `?search=laptop&status=ACTIVE` avec page 1. ✓

- [ ] **Step 3 : Commit final si ajustements**

```bash
git add -A
git commit -m "fix(frontend): url table params final adjustments"
```
