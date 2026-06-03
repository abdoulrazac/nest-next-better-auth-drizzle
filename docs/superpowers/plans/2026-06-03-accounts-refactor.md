# Accounts Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all broken `accounts/` route pages (tRPC, `@/components/shared`, `@/server/better-auth/*`) with clean wrappers over the already-built `features/users/`, `features/roles/`, and `features/audit-logs/` modules; add a `RoleDetailSheet`; fix two hook bugs.

**Architecture:** Each route `page.tsx` becomes a 5-line wrapper delegating to its feature component. Feature modules are corrected in-place (audit-logs hook syntax, add role detail sheet). Old orphaned sub-pages under `accounts/users/[userId]/` and `accounts/roles/[roleId]/` are deleted.

**Tech Stack:** Next.js 15, TanStack Query, `apiClient` from `@/lib/api`, `@hey-api/client-fetch`, ShadcnUI, HugeIcons via `@/lib/icons`, Zod v4 + `zodResolver(schema as any) as any`, TypeScript strict.

---

## File Map

| Action | Path |
|---|---|
| Modify | `apps/frontend/src/features/audit-logs/hooks.ts` |
| Create | `apps/frontend/src/features/roles/detail-sheet.tsx` |
| Modify | `apps/frontend/src/features/roles/hooks.ts` |
| Modify | `apps/frontend/src/features/roles/columns.tsx` |
| Modify | `apps/frontend/src/features/roles/index.tsx` |
| Replace | `apps/frontend/src/app/(dashboard)/accounts/users/page.tsx` |
| Replace | `apps/frontend/src/app/(dashboard)/accounts/roles/page.tsx` |
| Replace | `apps/frontend/src/app/(dashboard)/accounts/audits/page.tsx` |
| Delete | `apps/frontend/src/app/(dashboard)/accounts/users/[userId]/page.tsx` |
| Delete | `apps/frontend/src/app/(dashboard)/accounts/roles/page.tsx` (old content) |
| Delete | `apps/frontend/src/app/(dashboard)/accounts/roles/[roleId]/page.tsx` |
| Delete | `apps/frontend/src/app/(dashboard)/accounts/roles/[roleId]/edit/` (dir) |
| Delete | `apps/frontend/src/app/(dashboard)/accounts/roles/new/` (dir) |

---

### Task 1: Fix `features/audit-logs/hooks.ts` — wrong apiClient call syntax

**Files:**
- Modify: `apps/frontend/src/features/audit-logs/hooks.ts`

The current code calls `apiClient.get` with positional arguments (old fetch style). The project uses `@hey-api/client-fetch` which takes an options object `{ url, query }`.

- [ ] **Step 1: Open and read the current file**

File: `apps/frontend/src/features/audit-logs/hooks.ts`

Current broken code:
```ts
const res = await (apiClient.get as any)("/v1/audit-logs", { query: params });
return res as AuditLogsPaginatedResponse;
```

- [ ] **Step 2: Replace the queryFn with correct syntax**

Replace the entire `queryFn` in `useListAuditLogs` with:
```ts
queryFn: async () => {
  const res = (await apiClient.get({
    url: "/v1/audit-logs",
    query: params,
  })) as any;
  return res.data as AuditLogsPaginatedResponse;
},
```

Final file content:
```ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { AuditLog, AuditLogsPaginatedResponse } from "./types";

export const auditKeys = {
  all: ["audit-logs"] as const,
  list: (params?: object) => [...auditKeys.all, "list", params] as const,
};

export function useListAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  action?: string;
}) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: async () => {
      const res = (await apiClient.get({
        url: "/v1/audit-logs",
        query: params,
      })) as any;
      return res.data as AuditLogsPaginatedResponse;
    },
    staleTime: 60_000,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/audit-logs/hooks.ts
git commit -m "fix(audit-logs): correct apiClient.get call syntax"
```

---

### Task 2: Add `useGetRole` to `features/roles/hooks.ts`

**Files:**
- Modify: `apps/frontend/src/features/roles/hooks.ts`

`useGetRole` is needed by the detail sheet (Task 3).

- [ ] **Step 1: Add `useGetRole` to `features/roles/hooks.ts`**

Open the file and add after the `useListRoles` function:
```ts
export function useGetRole(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: roleKeys.detail(id ?? ""),
    queryFn: async () => {
      const res = (await apiClient.get({
        url: `/v1/roles/${id}`,
      })) as any;
      return res.data as Role;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}
```

Also add `Role` to the imports at the top if not already present:
```ts
import type { Role, RolesPaginatedResponse } from "./types";
```

(It's already there — no change needed on imports.)

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/roles/hooks.ts
git commit -m "feat(roles): add useGetRole hook"
```

---

### Task 3: Create `features/roles/detail-sheet.tsx`

**Files:**
- Create: `apps/frontend/src/features/roles/detail-sheet.tsx`

A slide-over sheet showing role name, permissions list, created date, with Edit/Delete actions.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { EditIcon, TrashIcon } from "@/lib/icons";
import { useGetRole } from "./hooks";
import type { Role } from "./types";

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

interface RoleDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string | null;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleDetailSheet({
  open,
  onOpenChange,
  roleId,
  onEdit,
  onDelete,
}: RoleDetailSheetProps) {
  const { data: role, isLoading } = useGetRole(roleId, {
    enabled: open && !!roleId,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Détails du rôle</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-6 w-48" />
            <Separator />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : role ? (
          <>
            <div className="mt-4">
              <p className="text-lg font-semibold">{role.name}</p>
            </div>

            <Separator className="my-2" />

            <div className="flex-1 divide-y overflow-y-auto">
              <DetailRow
                label="Permissions"
                value={
                  role.permissions && role.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {role.permissions.map((p) => (
                        <Badge key={p} variant="outline" className="font-mono text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Aucune</span>
                  )
                }
              />
              <DetailRow
                label="Nombre de permissions"
                value={
                  <Badge variant="secondary">
                    {role.permissions?.length ?? 0}
                  </Badge>
                }
              />
              <DetailRow
                label="Créé le"
                value={
                  role.createdAt
                    ? new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                      }).format(new Date(role.createdAt))
                    : "—"
                }
              />
              <DetailRow
                label="ID"
                value={<span className="font-mono text-xs">{role.id}</span>}
              />
            </div>

            <Separator className="mt-auto" />
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(role)}
              >
                <Icon icon={EditIcon} size={14} className="mr-2" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => onDelete(role)}
              >
                <Icon icon={TrashIcon} size={14} className="mr-2" />
                Supprimer
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/roles/detail-sheet.tsx
git commit -m "feat(roles): add RoleDetailSheet component"
```

---

### Task 4: Add `onView` action to `features/roles/columns.tsx` + wire detail sheet in `features/roles/index.tsx`

**Files:**
- Modify: `apps/frontend/src/features/roles/columns.tsx`
- Modify: `apps/frontend/src/features/roles/index.tsx`

- [ ] **Step 1: Update `buildColumns` in `columns.tsx` to accept and use `onView`**

Change the `BuildColumnsOptions` interface and add the View action:

```tsx
import { EyeIcon, EditIcon, TrashIcon } from "@/lib/icons";

interface BuildColumnsOptions {
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function buildColumns({
  onView,
  onEdit,
  onDelete,
}: BuildColumnsOptions): ColumnDef<Role>[] {
```

In the `actions` column cell, add the View action first:
```tsx
{
  id: "actions",
  cell: ({ row }) => {
    const role = row.original;
    return (
      <CellActions
        actions={[
          { label: "Voir", icon: EyeIcon, onClick: () => onView(role) },
          { label: "Modifier", icon: EditIcon, onClick: () => onEdit(role) },
          {
            label: "Supprimer",
            icon: TrashIcon,
            onClick: () => onDelete(role),
            variant: "destructive",
            separator: true,
          },
        ]}
      />
    );
  },
},
```

- [ ] **Step 2: Update `features/roles/index.tsx` to add sheet state and `RoleDetailSheet`**

Add imports at the top of the file:
```tsx
import { RoleDetailSheet } from "./detail-sheet";
```

Add state variables after existing state declarations:
```tsx
const [sheetOpen, setSheetOpen] = useState(false);
const [sheetRoleId, setSheetRoleId] = useState<string | null>(null);
```

Update `buildColumns` call to pass `onView`:
```tsx
const columns = useMemo(
  () =>
    buildColumns({
      onView: (role) => {
        setSheetRoleId(role.id);
        setSheetOpen(true);
      },
      onEdit: (role) => {
        setEditTarget(role);
        setDialogOpen(true);
      },
      onDelete: (role) => {
        setDeleteId(role.id);
      },
    }),
  [],
);
```

Add `RoleDetailSheet` to the JSX (before the closing `</div>`):
```tsx
<RoleDetailSheet
  open={sheetOpen}
  onOpenChange={setSheetOpen}
  roleId={sheetRoleId}
  onEdit={(role) => {
    setSheetOpen(false);
    setEditTarget(role);
    setDialogOpen(true);
  }}
  onDelete={(role) => {
    setSheetOpen(false);
    setDeleteId(role.id);
  }}
/>
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/roles/columns.tsx apps/frontend/src/features/roles/index.tsx
git commit -m "feat(roles): add onView action and wire RoleDetailSheet"
```

---

### Task 5: Replace `accounts/users/page.tsx`

**Files:**
- Replace: `apps/frontend/src/app/(dashboard)/accounts/users/page.tsx`

The old file uses tRPC, `_components/`, `authClient`, broken imports. Replace with a clean wrapper.

- [ ] **Step 1: Overwrite the file**

```tsx
import { UsersPage } from "@/features/users";

export default function Page() {
  return <UsersPage />;
}
```

- [ ] **Step 2: Ensure `features/users/index.tsx` re-exports `UsersPage`**

The file already exports `export function UsersPage()` — no change needed. But if `@/features/users` (barrel) doesn't exist, create `apps/frontend/src/features/users/index.ts` that re-exports:

Check if there's a barrel: the existing `index.tsx` exports `UsersPage` as a named export directly — import path `@/features/users` resolves to `@/features/users/index.tsx` which works.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/\(dashboard\)/accounts/users/page.tsx
git commit -m "refactor(accounts/users): replace broken page with UsersPage wrapper"
```

---

### Task 6: Replace `accounts/roles/page.tsx`

**Files:**
- Replace: `apps/frontend/src/app/(dashboard)/accounts/roles/page.tsx`

- [ ] **Step 1: Overwrite the file**

```tsx
import { RolesPage } from "@/features/roles";

export default function Page() {
  return <RolesPage />;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app/\(dashboard\)/accounts/roles/page.tsx
git commit -m "refactor(accounts/roles): replace broken page with RolesPage wrapper"
```

---

### Task 7: Replace `accounts/audits/page.tsx`

**Files:**
- Replace: `apps/frontend/src/app/(dashboard)/accounts/audits/page.tsx`

- [ ] **Step 1: Overwrite the file**

```tsx
import { AuditLogsPage } from "@/features/audit-logs";

export default function Page() {
  return <AuditLogsPage />;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app/\(dashboard\)/accounts/audits/page.tsx
git commit -m "refactor(accounts/audits): replace broken page with AuditLogsPage wrapper"
```

---

### Task 8: Delete orphaned sub-pages

**Files:**
- Delete: `apps/frontend/src/app/(dashboard)/accounts/users/[userId]/` (entire dir)
- Delete: `apps/frontend/src/app/(dashboard)/accounts/roles/[roleId]/` (entire dir)
- Delete: `apps/frontend/src/app/(dashboard)/accounts/roles/new/` (entire dir)

These pages use tRPC and broken imports. With sheet-based detail and dialog-based create/edit, they are no longer needed.

- [ ] **Step 1: Remove orphaned directories**

```bash
rm -rf "apps/frontend/src/app/(dashboard)/accounts/users/[userId]"
rm -rf "apps/frontend/src/app/(dashboard)/accounts/roles/[roleId]"
rm -rf "apps/frontend/src/app/(dashboard)/accounts/roles/new"
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore(accounts): remove orphaned sub-pages (replaced by sheets/dialogs)"
```

---

### Task 9: Verify — run TypeScript check

- [ ] **Step 1: Run tsc**

```bash
cd apps/frontend && npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -60
```

Expected: errors in `accounts/` and `features/` relating to these modules should be gone. Remaining errors should only be in other unrelated legacy files (e.g. `_components` of other routes).

- [ ] **Step 2: Fix any new errors found in accounts/ or features/**

If errors appear in:
- `features/roles/detail-sheet.tsx` — check `Icon`, `EditIcon`, `TrashIcon` imports from `@/lib/icons`
- `features/roles/columns.tsx` — check `EyeIcon` import from `@/lib/icons`
- `features/roles/index.tsx` — check `sheetRoleId` state type

Fix inline and commit:
```bash
git add apps/frontend/src/features/roles/
git commit -m "fix(roles): resolve TypeScript errors in detail sheet and columns"
```

- [ ] **Step 3: Confirm error count has not increased**

Run tsc again and compare error count to the baseline (219 pre-existing errors):
```bash
cd apps/frontend && npx tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: ≤ 219 (ideally fewer, since broken accounts pages are now replaced).
