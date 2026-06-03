# Phase 4 — 7 Skills Agents

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer 7 fichiers SKILL.md dans `.agents/skills/` documentant les patterns UI de ce projet pour les agents IA.

**Architecture:** Chaque skill est un fichier SKILL.md autonome avec frontmatter YAML, exemples de code complets et checklist. Les skills référencent les composants créés en Phase 2 et le layout de Phase 3.

**Tech Stack:** Markdown, exemples TypeScript/TSX

**Prérequis :** Phases 1, 2, 3 terminées (les composants référencés doivent exister)

---

## Adaptations communes (rappel)

| sfe_pi                                     | Ce projet                                 |
| ------------------------------------------ | ----------------------------------------- |
| `api.module.entity.*` (tRPC)               | Hooks `@repo/api-client` + TanStack Query |
| Import direct `@hugeicons/core-free-icons` | Toujours via `@/lib/icons`                |
| `src/types/enums.ts`                       | `@repo/validators/<domain>`               |
| Prisma                                     | Drizzle (`packages/db/`)                  |
| tRPC router                                | NestJS controller                         |
| `permission.ts` tRPC                       | Better Auth RBAC                          |
| `components/shared/*`                      | `components/*` (racine)                   |

---

## Task 1 — shared-components/SKILL.md

**Files:**

- Create: `.agents/skills/shared-components/SKILL.md`

- [ ] **Créer le dossier et le fichier**

```bash
mkdir -p .agents/skills/shared-components
```

- [ ] **Écrire le skill**

````markdown
---
name: shared-components
description: "Reference guide for the project's shared UI components: BasePage, PageHeader, TableHeader, DataTable, CellActions, StatusBadge, DetailSection, DetailTabs, Pagination, SingleSelect, ConfirmDialog. Use when composing admin pages, configuring table headers, adding row actions, or using any shared component."
---

# Shared Components Reference

## Import rule — Icons

NEVER import from `@hugeicons/core-free-icons` directly. Always via `@/lib/icons`:

```tsx
import { EditIcon, TrashIcon, PlusIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";

<HugeiconsIcon icon={EditIcon} className="h-4 w-4" />;
```
````

---

## BasePage

Wraps every dashboard page. Provides header (SidebarTrigger + Breadcrumbs + CommandMenu + ThemeSwitcher) and max-width content area.

```tsx
import { BasePage } from "@/components/layout/base-page";

<BasePage breadcrumbs={[{ title: "Utilisateurs", url: "/account/users" }]}>
  {children}
</BasePage>;
```

| Prop          | Type                                | Required |
| ------------- | ----------------------------------- | -------- |
| `breadcrumbs` | `{ title: string; url?: string }[]` | No       |
| `children`    | `ReactNode`                         | Yes      |
| `className`   | `string`                            | No       |

---

## PageHeader

Page title with optional status, description, back navigation, and action buttons.

```tsx
import PageHeader, { PageHeaderActions } from "@/components/page-header";

// List page
<PageHeader
  title="Utilisateurs"
  description="Gérez vos utilisateurs"
  variant="list"
  primaryAction={PageHeaderActions.create("/account/users/new", "Nouvel utilisateur")}
/>

// Detail page with back button and status
<PageHeader
  title={user.name}
  variant="detail"
  backNavigation
  status={<StatusBadge status={user.status} />}
  primaryAction={PageHeaderActions.edit(`/account/users/${id}/edit`)}
/>

// Detail card variant (with background blur)
<PageHeader
  title={user.name}
  variant="detail-card"
  backNavigation={{ href: "/account/users", label: "Utilisateurs" }}
  primaryAction={PageHeaderActions.edit(`/account/users/${id}/edit`)}
  secondaryActions={[PageHeaderActions.export(handleExport)]}
/>
```

| Prop               | Type                                                                     | Required |
| ------------------ | ------------------------------------------------------------------------ | -------- |
| `title`            | `string`                                                                 | Yes      |
| `description`      | `string`                                                                 | No       |
| `variant`          | `"default" \| "list" \| "detail" \| "detail-card" \| "create" \| "edit"` | No       |
| `backNavigation`   | `boolean \| { label?: string; href?: string; onClick?: () => void }`     | No       |
| `primaryAction`    | `HeaderAction`                                                           | No       |
| `secondaryActions` | `HeaderAction[]`                                                         | No       |
| `status`           | `ReactNode`                                                              | No       |
| `isLoading`        | `boolean`                                                                | No       |

**PageHeaderActions helpers:**

- `PageHeaderActions.create(href, label?)` — bouton primaire avec icône +
- `PageHeaderActions.edit(href)` — bouton outline Modifier
- `PageHeaderActions.save(onClick, loading?)` — bouton Enregistrer
- `PageHeaderActions.delete(onClick)` — bouton destructive Supprimer
- `PageHeaderActions.export(onClick)` — bouton outline Exporter
- `PageHeaderActions.cancel(href)` — bouton ghost Annuler
- `PageHeaderActions.refresh(onClick)` — bouton ghost Actualiser

---

## TableHeader

Search bar + filters + reset + bulk action bar.

```tsx
import TableHeader, {
  createSearchField,
  createFilterField,
  createResetButton,
  createBulkActions,
} from "@/components/table-header";
import SingleSelect from "@/components/single-select";

<TableHeader
  search={createSearchField(searchTerm, setSearchTerm, {
    placeholder: "Rechercher...",
  })}
  filters={[
    createFilterField(
      "status",
      <SingleSelect
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        options={[
          { value: "ACTIVE", label: "Actif" },
          { value: "INACTIVE", label: "Inactif" },
        ]}
        placeholder="Statut"
        btnClassName="min-w-28"
      />,
    ),
  ]}
  actions={[
    createResetButton(() => {
      setSearchTerm("");
      setStatusFilter("");
      setPage(1);
    }),
  ]}
  bulkActions={
    selectedItems.length > 0
      ? createBulkActions(
          selectedItems.length,
          [
            {
              label: "Supprimer",
              icon: <HugeiconsIcon icon={TrashIcon} className="h-4 w-4" />,
              onClick: handleBulkDelete,
              variant: "destructive",
            },
          ],
          { onClose: () => setSelectedItems([]) },
        )
      : undefined
  }
/>;
```

---

## DataTable

TanStack Table wrapper with sorting, selection, and loading skeleton.

```tsx
import { DataTable } from "@/components/data-table/data-table";

<DataTable
  columns={columns}
  data={items}
  isLoading={isLoading}
  pagination={false} // Use separate <Pagination /> below
  selectable
  onSelectionChange={setSelectedItems}
  emptyMessage="Aucun utilisateur trouvé."
/>;
```

| Prop                | Type                  | Default                    |
| ------------------- | --------------------- | -------------------------- |
| `columns`           | `ColumnDef<T>[]`      | required                   |
| `data`              | `T[]`                 | required                   |
| `isLoading`         | `boolean`             | `false`                    |
| `pagination`        | `boolean`             | `true`                     |
| `selectable`        | `boolean`             | `false`                    |
| `onSelectionChange` | `(rows: T[]) => void` | —                          |
| `onRowClick`        | `(row: T) => void`    | —                          |
| `emptyMessage`      | `string`              | `"Aucune donnée trouvée."` |

---

## CellActions

Row-level action buttons. First N visible inline, rest in dropdown.

```tsx
import CellActions, {
  createViewAction,
  createEditAction,
  createDeleteAction,
} from "@/components/cell-actions";

<CellActions
  visibleActions={1}
  actions={[
    createViewAction(() => setSelectedId(row.original.id)),
    createEditAction(() =>
      router.push(`/account/users/${row.original.id}/edit`),
    ),
    createDeleteAction(() => deleteUser.mutateAsync({ id: row.original.id })),
  ]}
/>;
```

**Factory functions:**

- `createViewAction(hrefOrFn, tooltip?)` — icône Eye
- `createEditAction(onClick, tooltip?)` — icône Edit
- `createDeleteAction(onClick, opts?)` — icône Trash, confirmDialog auto
- `createCopyAction(onClick, tooltip?)`
- `createOpenAction(onClick, tooltip?)`
- `createNavigateAction(href, tooltip?)`
- `createCancelAction(onClick, tooltip?)` — confirmDialog auto
- `createSendEmailAction(onClick, tooltip?)` — confirmDialog auto
- `createPreviewAction(onClick, tooltip?)`
- `createValidateAction(onClick, tooltip?)`
- `createDuplicateAction(onClick, tooltip?)`
- `createToggleStatusAction(onClick, isActive, tooltip?)`
- `createAction(icon, onClick?, options?)`

**StandardCellActions** pour les cas simples :

```tsx
import { StandardCellActions } from "@/components/cell-actions";

<StandardCellActions
  viewHref={`/account/users/${row.original.id}`}
  onEdit={() => router.push(`/account/users/${row.original.id}/edit`)}
  onDelete={() => deleteUser.mutateAsync({ id: row.original.id })}
  deleteLabel={`l'utilisateur "${row.original.name}"`}
/>;
```

---

## StatusBadge

Auto-maps status strings to colored badges.

```tsx
import { StatusBadge } from "@/components/status-badge";

<StatusBadge status={user.status} />
<StatusBadge status="ACTIVE" showDot />
<StatusBadge status="PENDING" variant="warning" />
```

Statuts mappés : `ACTIVE`, `INACTIVE`, `DRAFT`, `PENDING`, `VALIDATED`, `CANCELLED`, `PAID`, `PARTIALLY_PAID`, `SENT`, `ACCEPTED`, `REFUSED`, `EXPIRED`, `IN_PREPARATION`, `PARTIALLY_DELIVERED`, `DELIVERED`, `INVOICED`, `IN_PROGRESS`, `PARTIAL`, `PARTIALLY_RECEIVED`, `RECEIVED`, `COMPLETED`, `ENABLED`, `DISABLED`.

---

## DetailSection / DetailGrid / DetailCard / DetailSummary

Section wrapper for detail pages.

```tsx
import { DetailSection, DetailGrid, DetailItem, DetailCard, DetailSummary } from "@/components/detail-section";

<DetailSection title="Informations" description="Détails du compte" action={<Button size="sm">Modifier</Button>}>
  <DetailGrid columns={2}>
    <DetailItem label="Nom" value={user.name} />
    <DetailItem label="Email" value={user.email} />
    <DetailItem label="Rôle" value={user.role} />
    <DetailItem label="Statut" value={<StatusBadge status={user.status} />} />
  </DetailGrid>
</DetailSection>

<DetailSummary
  title="Résumé"
  items={[
    { label: "Total", value: "1 200 €", variant: "success" },
    { label: "Impayé", value: "200 €", variant: "destructive" },
  ]}
/>
```

---

## DetailTabs

Tab navigation for detail pages.

```tsx
import {
  DetailTabs,
  createOverviewTab,
  createDetailsTab,
  createHistoryTab,
} from "@/components/detail-tabs";

<DetailTabs
  tabs={[
    createOverviewTab(<OverviewContent />),
    createDetailsTab(<DetailsContent />),
    createHistoryTab(<HistoryContent />),
  ]}
  defaultValue="overview"
/>;
```

Tab factories : `createOverviewTab`, `createDetailsTab`, `createHistoryTab`, `createDocumentsTab`, `createPaymentsTab`, `createOrdersTab`, `createInvoicesTab`, `createActivityTab`.

---

## Pagination

External pagination (not tied to react-table).

```tsx
import { Pagination } from "@/components/pagination";

{
  total > 0 && (
    <Pagination
      currentPage={page}
      totalPages={Math.ceil(total / pageSize)}
      pageSize={pageSize}
      totalCount={total}
      onPageChange={setPage}
      onPageSizeChange={(s) => {
        setPageSize(s);
        setPage(1);
      }}
    />
  );
}
```

---

## SingleSelect

Popover-based single select with search and optional inline create.

```tsx
import SingleSelect from "@/components/single-select";

<SingleSelect
  value={statusFilter}
  onValueChange={(v) => {
    setStatusFilter(v);
    setPage(1);
  }}
  options={[
    { value: "ACTIVE", label: "Actif" },
    { value: "INACTIVE", label: "Inactif" },
  ]}
  placeholder="Statut"
  btnClassName="min-w-28"
/>;
```

With server-side search:

```tsx
<SingleSelect
  value={value}
  onValueChange={setValue}
  onSearchChange={setQuery} // debounced 300ms
  options={searchResults}
  placeholder="Rechercher..."
  addNewLabel="Nouvel élément"
  onClickAddNew={() => setDialogOpen(true)}
  btnClassName="w-full max-w-lg"
/>
```

---

## ConfirmDialog + useConfirmDialog

```tsx
import {
  useConfirmDialog,
  confirmDialogPresets,
} from "@/components/hooks/use-confirm-dialog";

const { confirm, ConfirmDialogComponent } = useConfirmDialog();

const handleDelete = async () => {
  const ok = await confirm(confirmDialogPresets.delete("cet utilisateur"));
  if (!ok) return;
  await deleteUser.mutateAsync({ id });
};

// Toujours rendre ConfirmDialogComponent à la racine de la page
return (
  <>
    {/* ... page content ... */}
    {ConfirmDialogComponent}
  </>
);
```

Presets : `confirmDialogPresets.delete(name)`, `.cancel()`, `.archive()`, `.restore()`

---

## Bulk Actions

```tsx
import {
  executeBulkAction,
  showBulkResultToast,
} from "@/components/hooks/use-bulk-selection";
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const handleBulkDelete = async () => {
  const result = await executeBulkAction(selectedItems, (item) =>
    deleteUser.mutateAsync({ id: item.id }),
  );
  showBulkResultToast(result, "Supprimés", "Erreur de suppression");
  setSelectedItems([]);
  await queryClient.invalidateQueries({ queryKey: ["users"] });
};
```

````

- [ ] **Commit**
```bash
git add .agents/skills/shared-components/
git commit -m "feat(agents): add shared-components skill"
````

---

## Task 2 — list-page/SKILL.md (remplace nextjs-list-page)

**Files:**

- Modify: `.agents/skills/nextjs-list-page/SKILL.md`

- [ ] **Remplacer le contenu de `.agents/skills/nextjs-list-page/SKILL.md`**

```markdown
---
name: list-page
description: "Scaffold a new list page with DataTable, search, filters, bulk actions, pagination, and confirm dialogs. Pattern: centralised hook owns all mutations, handlers, configs, and ConfirmDialog. Thin page consumes hook. DetailSheet receives handlers via props. Use when creating any admin list/index page."
---

# List Page Scaffold

## When to Use

- Creating a new entity listing page
- Adding paginated, searchable, filterable table with CRUD
- Adding bulk actions (delete, export) to a list

## File Structure
```

src/features/<entity>/
├── index.tsx # List page — thin consumer
├── columns.tsx # Column definitions factory
├── hooks.ts # Centralised hook (data + handlers + configs)
├── schema.ts # Zod schemas
├── types.ts # TypeScript types (from @repo/validators)
├── detail-sheet.tsx # Detail sheet (receives handlers via props)
└── mutate-dialog.tsx # Create/edit dialog

````

## Step 1 — Centralised Hook (`hooks.ts`)

The hook owns everything. The detail sheet and any embedded table receive `handlers` via props — no duplicated mutations.

```tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@repo/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useConfirmDialog, confirmDialogPresets } from "@/components/hooks/use-confirm-dialog";
import { executeBulkAction, showBulkResultToast } from "@/components/hooks/use-bulk-selection";
import { createSearchField, createFilterField, createResetButton, createBulkActions } from "@/components/table-header";
import { buildEntityColumns } from "./columns";
import type { Entity } from "./types";
import type { TrashIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function useEntity() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // ── State ──────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState<Entity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["entities", page, pageSize, searchTerm, statusFilter],
    queryFn: () => client.entities.list({ page, pageSize, search: searchTerm, status: statusFilter || undefined }),
  });

  const items: Entity[] = data?.data?.items ?? [];
  const total: number = data?.data?.total ?? 0;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.entities.delete({ path: { id } }),
    onSuccess: () => {
      toast.success("Élément supprimé");
      void queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlers = {
    onView: (id: string) => setSelectedId(id),
    onEdit: (id: string) => router.push(`/module/entities/${id}/edit`),
    onDelete: async (id: string) => {
      const ok = await confirm(confirmDialogPresets.delete("cet élément"));
      if (!ok) return;
      await deleteMutation.mutateAsync(id);
    },
    onBulkDelete: async () => {
      const ok = await confirm(confirmDialogPresets.delete(`${selectedItems.length} éléments`));
      if (!ok) return;
      const result = await executeBulkAction(selectedItems, (item) => deleteMutation.mutateAsync(item.id));
      showBulkResultToast(result, "Supprimés", "Erreur");
      setSelectedItems([]);
      void queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  };

  // ── Table config ───────────────────────────────────────────────────────────
  const columns = useMemo(() => buildEntityColumns(handlers), []);

  const searchConfig = createSearchField(searchTerm, (v) => { setSearchTerm(v); setPage(1); }, { placeholder: "Rechercher..." });

  const filtersConfig = [
    createFilterField("status", (
      <SingleSelect
        value={statusFilter}
        onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
        options={[{ value: "ACTIVE", label: "Actif" }, { value: "INACTIVE", label: "Inactif" }]}
        placeholder="Statut"
        btnClassName="min-w-28"
      />
    )),
  ];

  const actionsConfig = [
    createResetButton(() => { setSearchTerm(""); setStatusFilter(""); setPage(1); }),
  ];

  const bulkActionsConfig = selectedItems.length > 0
    ? createBulkActions(
        selectedItems.length,
        [{ label: "Supprimer", icon: <HugeiconsIcon icon={TrashIcon} className="h-4 w-4" />, onClick: handlers.onBulkDelete, variant: "destructive" }],
        { onClose: () => setSelectedItems([]) },
      )
    : undefined;

  return {
    items, total, isLoading, error,
    page, setPage, pageSize, setPageSize,
    selectedItems, setSelectedItems,
    selectedId, setSelectedId,
    handlers,
    columns, searchConfig, filtersConfig, actionsConfig, bulkActionsConfig,
    ConfirmDialogComponent,
  };
}
````

## Step 2 — Column Factory (`columns.tsx`)

```tsx
"use client";

import CellActions, {
  createViewAction,
  createEditAction,
  createDeleteAction,
} from "@/components/cell-actions";
import { StatusBadge } from "@/components/status-badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { Entity } from "./types";

interface ColumnCallbacks {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function buildEntityColumns(cb: ColumnCallbacks): ColumnDef<Entity>[] {
  return [
    { accessorKey: "reference", header: "Référence" },
    { accessorKey: "name", header: "Nom" },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CellActions
          visibleActions={1}
          actions={[
            createViewAction(() => cb.onView(row.original.id)),
            createEditAction(() => cb.onEdit(row.original.id)),
            createDeleteAction(() => cb.onDelete(row.original.id)),
          ]}
        />
      ),
    },
  ];
}
```

## Step 3 — List Page (`index.tsx`)

Thin consumer — calls the hook once, wires JSX.

```tsx
"use client";

import { BasePage } from "@/components/layout/base-page";
import { Pagination } from "@/components/pagination";
import { DataTable } from "@/components/data-table/data-table";
import PageHeader, { PageHeaderActions } from "@/components/page-header";
import TableHeader from "@/components/table-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EntityDetailSheet } from "./detail-sheet";
import { useEntity } from "./hooks";

export default function EntityListPage() {
  const {
    items,
    total,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    setSelectedItems,
    selectedId,
    setSelectedId,
    handlers,
    columns,
    searchConfig,
    filtersConfig,
    actionsConfig,
    bulkActionsConfig,
    ConfirmDialogComponent,
  } = useEntity();

  return (
    <BasePage
      breadcrumbs={[
        { title: "Module", url: "/module" },
        { title: "Entités", url: "/module/entities" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Entités"
          description="Gérez vos entités"
          variant="list"
          primaryAction={PageHeaderActions.create(
            "/module/entities/new",
            "Nouveau",
          )}
        />
        <TableHeader
          search={searchConfig}
          filters={filtersConfig}
          actions={actionsConfig}
          bulkActions={bulkActionsConfig}
        />
        {error && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertDescription>
              Erreur : {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          pagination={false}
          selectable
          onSelectionChange={setSelectedItems}
          emptyMessage="Aucune entité trouvée."
        />
        {total > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / pageSize)}
            pageSize={pageSize}
            totalCount={total}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        )}
      </div>

      {ConfirmDialogComponent}

      <EntityDetailSheet
        entityId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        handlers={handlers}
      />
    </BasePage>
  );
}
```

## Checklist

- [ ] `"use client"` en tête de tous les fichiers
- [ ] Hook centralisé (`hooks.ts`) — mutations, handlers, configs, ConfirmDialogComponent
- [ ] Page fine — aucune mutation ni handler définis dans la page
- [ ] `BasePage` avec breadcrumbs
- [ ] `PageHeader variant="list"` avec `primaryAction`
- [ ] `TableHeader` consomme searchConfig / filtersConfig / actionsConfig / bulkActionsConfig
- [ ] `DataTable` avec `pagination={false}`, `selectable`, `onSelectionChange`
- [ ] `Pagination` séparée en-dessous
- [ ] `ConfirmDialogComponent` rendu une fois à la racine
- [ ] `DetailSheet` reçoit `handlers` via props (pas de mutations propres)
- [ ] Changement de filtre remet page à 1
- [ ] Labels, toasts, placeholders en français

````

- [ ] **Commit**
```bash
git add .agents/skills/nextjs-list-page/
git commit -m "feat(agents): update list-page skill with centralised hook pattern"
````

---

## Task 3 — entity-select/SKILL.md

**Files:**

- Create: `.agents/skills/entity-select/SKILL.md`

- [ ] **Créer le dossier**

```bash
mkdir -p .agents/skills/entity-select
```

- [ ] **Écrire le skill**

```markdown
---
name: entity-select
description: "Scaffold a searchable entity select with debounced search via @repo/api-client, deduplication, and optional inline create dialog. Use when adding a searchable dropdown for a related entity (user, role, etc.) inside a form."
---

# Entity Select Scaffold

## When to Use

- Select d'une entité liée dans un formulaire
- Création inline sans quitter le formulaire
- Résultats paginés via `@repo/api-client`

## File Structure
```

src/features/<entity>/\_components/
├── <entity>-select.tsx # Select avec search debounced
└── create-<entity>-dialog.tsx # Dialog de création inline

````

## Step 1 — Entity Select

```tsx
"use client";

import SingleSelect from "@/components/single-select";
import { useQuery } from "@tanstack/react-query";
import { client } from "@repo/api-client";
import { useState } from "react";
import { CreateEntityDialog } from "./create-entity-dialog";

interface EntitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  defaultEntityId?: string;
  isEditing?: boolean;
  disabled?: boolean;
}

export function EntitySelect({ value, onValueChange, defaultEntityId, isEditing, disabled }: EntitySelectProps) {
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: searchData } = useQuery({
    queryKey: ["entities", "search", query],
    queryFn: () => client.entities.list({ search: query, pageSize: 20 }),
  });

  const { data: defaultData } = useQuery({
    queryKey: ["entities", defaultEntityId],
    queryFn: () => client.entities.get({ path: { id: defaultEntityId! } }),
    enabled: !!defaultEntityId && !isEditing,
  });

  const { data: selectedData } = useQuery({
    queryKey: ["entities", value],
    queryFn: () => client.entities.get({ path: { id: value } }),
    enabled: !!value && value !== defaultEntityId,
  });

  const searchEntities = searchData?.data?.items ?? [];
  const extras = [defaultData?.data, selectedData?.data].filter(
    (e): e is NonNullable<typeof e> => !!e && !searchEntities.find((s) => s.id === e.id),
  );
  const options = [...extras, ...searchEntities].map((e) => ({
    value: e.id,
    label: `${e.name}${e.reference ? ` (${e.reference})` : ""}`,
  }));

  return (
    <>
      <SingleSelect
        value={value}
        onValueChange={onValueChange}
        onSearchChange={setQuery}
        options={options}
        placeholder="Rechercher..."
        addNewLabel="Nouvel élément"
        onClickAddNew={() => setDialogOpen(true)}
        disabled={disabled}
        btnClassName="w-full max-w-lg"
      />
      <CreateEntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(entity) => {
          onValueChange(entity.id);
          setDialogOpen(false);
        }}
      />
    </>
  );
}
````

## Step 2 — Create Dialog

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EntityForm } from "./entity-form";

interface CreateEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (entity: {
    id: string;
    name: string;
    reference?: string;
  }) => void;
}

export function CreateEntityDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateEntityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvel élément</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="pr-3">
            <EntityForm
              formId="create-entity-dialog-form"
              onCreated={onCreated}
            />
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form="create-entity-dialog-form">
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Form Integration (React Hook Form)

```tsx
<Controller
  control={form.control}
  name="entityId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Entité *</FormLabel>
      <EntitySelect
        value={field.value}
        onValueChange={field.onChange}
        defaultEntityId={defaultEntityId}
        isEditing={isEditing}
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

## Checklist

- [ ] `useQuery` pour search + default + selected (3 queries, déduplication)
- [ ] `onSearchChange` → debounce 300ms dans `SingleSelect`
- [ ] `defaultEntityId` + `isEditing` pour pré-remplissage
- [ ] Dialog inline avec `formId` pour submit externe
- [ ] `btnClassName="w-full max-w-lg"` dans les formulaires
- [ ] Labels en français

````

- [ ] **Commit**
```bash
git add .agents/skills/entity-select/
git commit -m "feat(agents): add entity-select skill"
````

---

## Task 4 — embedded-table/SKILL.md

**Files:**

- Create: `.agents/skills/embedded-table/SKILL.md`

- [ ] **Créer le dossier**

```bash
mkdir -p .agents/skills/embedded-table
```

- [ ] **Écrire le skill** (template du hook centralisé + thin consumer + matrice)

```markdown
---
name: embedded-table
description: "Template for the centralised hook pattern (hooks.ts) and embedded table thin consumer. Use when adding a related entity table inside a detail page tab. The centralised hook owns all mutations, handlers, and ConfirmDialog — the embedded table and detail sheet receive handlers via props."
---

# Embedded Table Scaffold

## Pattern: Centralised Hook

`hooks.ts` est la **seule source de vérité** pour mutations + handlers + state.
La list page, l'embedded table, et la detail sheet consomment tous les mêmes `handlers`.
```

hooks.ts
└─ owns: mutations, handlers, state, ConfirmDialogComponent
↓ passes handlers via props
├─ index.tsx (list page)
├─ detail-sheet.tsx (reçoit handlers via props)
└─ embedded-<entity>-table.tsx (reçoit handlers + parentId via props)

````

## Shared vs Differs

| | List page | Embedded table | Detail sheet |
|---|---|---|---|
| Mutations | ✅ du hook | du hook parent | du hook parent |
| Handlers | ✅ du hook | props | props |
| ConfirmDialog | ✅ rendu 1 fois | non (délégué) | non (délégué) |
| Pagination | ✅ séparée | optionnelle | non |
| Filtres | ✅ tous | parentId seul | non |
| Sélection | ✅ | optionnelle | non |

## Embedded Table Component

```tsx
"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/pagination";
import { useQuery } from "@tanstack/react-query";
import { client } from "@repo/api-client";
import { useState } from "react";
import { buildEntityColumns } from "../columns";
import type { EntityHandlers } from "../hooks";

interface EmbeddedEntityTableProps {
  parentId: string;
  handlers: EntityHandlers;
}

export function EmbeddedEntityTable({ parentId, handlers }: EmbeddedEntityTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["entities", "byParent", parentId, page, pageSize],
    queryFn: () => client.entities.list({ parentId, page, pageSize }),
    enabled: !!parentId,
  });

  const items = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const columns = buildEntityColumns(handlers);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        pagination={false}
        emptyMessage="Aucun élément lié."
      />
      {total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / pageSize)}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      )}
    </div>
  );
}
````

## Export EntityHandlers type from hooks.ts

```ts
// Dans hooks.ts, exporter le type des handlers
export type EntityHandlers = ReturnType<typeof useEntity>["handlers"];
```

## Usage dans une tab de detail page

```tsx
// Dans detail-page tabs
createOverviewTab(
  <EmbeddedEntityTable parentId={entityId} handlers={handlers} />,
);
```

## Checklist

- [ ] Hook centralisé exporte `EntityHandlers` type
- [ ] Embedded table reçoit `handlers` via props — aucune mutation propre
- [ ] `enabled: !!parentId` sur la query
- [ ] `pagination={false}` sur DataTable + `<Pagination />` séparée si total > 0
- [ ] `emptyMessage` en français

````

- [ ] **Commit**
```bash
git add .agents/skills/embedded-table/
git commit -m "feat(agents): add embedded-table skill"
````

---

## Task 5 — nextjs-detail-sheet/SKILL.md (remplace existant)

**Files:**

- Modify: `.agents/skills/nextjs-detail-sheet/SKILL.md`

- [ ] **Remplacer le contenu**

````markdown
---
name: detail-sheet
description: "Scaffold a detail sheet (slide-over panel) for an entity. Sheet receives handlers via props from the centralised hook — no duplicated mutations or ConfirmDialog. Use when adding a quick-view panel to a list page."
---

# Detail Sheet Scaffold

## Pattern

La detail sheet ne possède PAS de mutations. Elle reçoit `handlers` du hook centralisé via props.

## Template

```tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { client } from "@repo/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import {
  DetailSection,
  DetailGrid,
  DetailItem,
} from "@/components/detail-section";
import {
  DetailTabs,
  createOverviewTab,
  createHistoryTab,
} from "@/components/detail-tabs";
import { Button } from "@/components/ui/button";
import { EditIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import type { EntityHandlers } from "./hooks";

interface EntityDetailSheetProps {
  entityId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handlers: EntityHandlers;
}

export function EntityDetailSheet({
  entityId,
  open,
  onOpenChange,
  handlers,
}: EntityDetailSheetProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["entities", entityId],
    queryFn: () => client.entities.get({ path: { id: entityId! } }),
    enabled: open && !!entityId,
  });

  const entity = data?.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <div className="flex items-center justify-between gap-2 pr-6">
              <div className="flex items-center gap-2">
                <SheetTitle>{entity?.name}</SheetTitle>
                {entity && <StatusBadge status={entity.status} />}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/module/entities/${entityId}/edit`);
                }}
              >
                <HugeiconsIcon icon={EditIcon} className="h-4 w-4" />
                Modifier
              </Button>
            </div>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : entity ? (
          <div className="p-6">
            <DetailTabs
              tabs={[
                createOverviewTab(
                  <DetailSection title="Informations">
                    <DetailGrid columns={2}>
                      <DetailItem label="Référence" value={entity.reference} />
                      <DetailItem label="Nom" value={entity.name} />
                      <DetailItem
                        label="Statut"
                        value={<StatusBadge status={entity.status} />}
                      />
                    </DetailGrid>
                  </DetailSection>,
                ),
                createHistoryTab(
                  <p className="text-sm text-muted-foreground">
                    Aucun historique.
                  </p>,
                ),
              ]}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
```
````

## Integration dans la list page

```tsx
<EntityDetailSheet
  entityId={selectedId}
  open={!!selectedId}
  onOpenChange={(open) => {
    if (!open) setSelectedId(null);
  }}
  handlers={handlers} // ← vient du hook centralisé, PAS de mutations dans le sheet
/>
```

## Checklist

- [ ] `enabled: open && !!entityId` sur la query
- [ ] Pas de mutations dans le sheet (handlers via props)
- [ ] Pas de ConfirmDialog dans le sheet (délégué au hook parent)
- [ ] `SheetContent` avec `overflow-y-auto`
- [ ] 3 états : loading (Skeleton) / data / null
- [ ] `DetailTabs` pour organiser le contenu

````

- [ ] **Commit**
```bash
git add .agents/skills/nextjs-detail-sheet/
git commit -m "feat(agents): update detail-sheet skill"
````

---

## Task 6 — nextjs-detail-page/SKILL.md (remplace existant)

**Files:**

- Modify: `.agents/skills/nextjs-detail-page/SKILL.md`

- [ ] **Remplacer le contenu**

````markdown
---
name: detail-page
description: "Scaffold a full detail/show page for an entity with loading/error/not-found guards, PageHeader variant=detail-card, DetailSection, DetailTabs, and optional KPI cards. Use when a resource detail is complex enough to need its own page."
---

# Detail Page Scaffold

## Template

```tsx
"use client";

import { BasePage } from "@/components/layout/base-page";
import PageHeader, { PageHeaderActions } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  DetailSection,
  DetailGrid,
  DetailItem,
  DetailSummary,
} from "@/components/detail-section";
import {
  DetailTabs,
  createOverviewTab,
  createHistoryTab,
} from "@/components/detail-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircleIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@repo/api-client";
import { notFound } from "next/navigation";

interface EntityDetailPageProps {
  params: { entityId: string };
}

export default function EntityDetailPage({ params }: EntityDetailPageProps) {
  const { entityId } = params;

  const { data, isLoading, error } = useQuery({
    queryKey: ["entities", entityId],
    queryFn: () => client.entities.get({ path: { id: entityId } }),
  });

  const entity = data?.data;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <BasePage
        breadcrumbs={[
          { title: "Entités", url: "/module/entities" },
          { title: "Chargement..." },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </BasePage>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BasePage
        breadcrumbs={[
          { title: "Entités", url: "/module/entities" },
          { title: "Erreur" },
        ]}
      >
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
          <AlertDescription>
            Impossible de charger cet élément.
          </AlertDescription>
        </Alert>
      </BasePage>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!entity) return notFound();

  // ── Content ──────────────────────────────────────────────────────────────
  return (
    <BasePage
      breadcrumbs={[
        { title: "Entités", url: "/module/entities" },
        { title: entity.name },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title={entity.name}
          variant="detail-card"
          backNavigation={{ href: "/module/entities", label: "Entités" }}
          status={<StatusBadge status={entity.status} />}
          primaryAction={PageHeaderActions.edit(
            `/module/entities/${entityId}/edit`,
          )}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Valeur 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{entity.value1 ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Valeur 2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{entity.value2 ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Valeur 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{entity.value3 ?? "—"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <DetailTabs
          tabs={[
            createOverviewTab(
              <DetailSection title="Informations générales">
                <DetailGrid columns={2}>
                  <DetailItem label="Référence" value={entity.reference} />
                  <DetailItem label="Nom" value={entity.name} />
                  <DetailItem
                    label="Statut"
                    value={<StatusBadge status={entity.status} />}
                  />
                  <DetailItem
                    label="Créé le"
                    value={new Date(entity.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  />
                </DetailGrid>
              </DetailSection>,
            ),
            createHistoryTab(
              <p className="text-sm text-muted-foreground p-4">
                Aucun historique.
              </p>,
            ),
          ]}
        />
      </div>
    </BasePage>
  );
}
```
````

## Checklist

- [ ] 3 états : loading (Skeleton) / error (Alert) / not-found (notFound())
- [ ] `BasePage` avec breadcrumbs corrects dans chaque état
- [ ] `PageHeader variant="detail-card"` avec `backNavigation`
- [ ] `StatusBadge` dans le header
- [ ] KPI cards si l'entité a des métriques
- [ ] `DetailTabs` pour organiser les sections
- [ ] `DetailSection` + `DetailGrid` + `DetailItem` pour les données
- [ ] Dates formatées en français (`toLocaleDateString("fr-FR")`)

````

- [ ] **Commit**
```bash
git add .agents/skills/nextjs-detail-page/
git commit -m "feat(agents): update detail-page skill"
````

---

## Task 7 — entity/SKILL.md

**Files:**

- Create: `.agents/skills/entity/SKILL.md`

- [ ] **Créer le dossier**

```bash
mkdir -p .agents/skills/entity
```

- [ ] **Écrire le skill**

````markdown
---
name: entity
description: "Scaffold a complete entity end-to-end: Drizzle schema, DB migration, validators, NestJS module+endpoints, API client regeneration, and all frontend pages (list, detail, form, select). Use when creating a brand-new entity from scratch."
---

# Full Entity Scaffold

## When to Use

- Créer une entité de zéro (ex: "payment", "project", "category")
- Besoin du full stack : base de données → API → pages

## Prerequisites

- Avoir identifié les champs, relations et statuts de l'entité
- Savoir dans quel module NestJS l'entité appartient

## Procedure — 10 Steps

### Step 1 — Drizzle Schema (`packages/db/src/schema/<entity>.ts`)

```ts
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const entities = pgTable("entities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  // champs spécifiques
  description: text("description"),
  organizationId: text("organization_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
```
````

### Step 2 — Export dans packages/db

Ajouter dans `packages/db/src/index.ts` :

```ts
export * from "./schema/entity";
```

### Step 3 — Migration

```bash
cd packages/db && bun run db:generate
bun run db:migrate
```

### Step 4 — Validators (`packages/validators/src/<entity>/`)

Utiliser le skill **nest-validator** pour créer les schemas Zod.

### Step 5 — NestJS Module

Utiliser le skill **nest-module** pour créer module + controller + service + repository.

### Step 6 — Endpoints

Utiliser le skill **nest-endpoint** pour chaque endpoint (list, get, create, update, delete).

### Step 7 — Regénérer l'API client

```bash
cd packages/api-client && bun run generate
```

Vérifier que les hooks `client.entities.*` sont disponibles.

### Step 8 — Frontend : Hook + Pages

Utiliser les skills dans l'ordre :

1. **embedded-table** → créer `hooks.ts` (centralised hook)
2. **list-page** → créer `index.tsx` + `columns.tsx`
3. **detail-page** → créer `[entityId]/page.tsx`
4. **detail-sheet** → créer `detail-sheet.tsx`
5. **entity-select** → créer `_components/entity-select.tsx` (si utilisé dans d'autres formulaires)

### Step 9 — Navigation

Ajouter dans `src/components/layout/sidebar-data.ts` :

```ts
{ title: "Entités", url: "/module/entities", icon: EntityIcon }
```

### Step 10 — Vérification

```bash
cd apps/frontend && bun run tsc --noEmit
cd apps/backend && bun run build
```

## Checklist

- [ ] Schema Drizzle avec `id` (cuid2), `createdAt`, `updatedAt`
- [ ] Export dans `packages/db/src/index.ts`
- [ ] Migration exécutée
- [ ] Validators Zod dans `packages/validators`
- [ ] Module NestJS (module + controller + service + repository)
- [ ] Endpoints : list (paginé + filtres), get, create, update, delete
- [ ] API client regénéré — `client.<entity>.*` disponibles
- [ ] Hook centralisé (`hooks.ts`) — mutations, handlers, ConfirmDialogComponent
- [ ] Column factory (`columns.tsx`)
- [ ] List page (`index.tsx`)
- [ ] Detail page (`[entityId]/page.tsx`)
- [ ] Detail sheet (`detail-sheet.tsx`) — reçoit handlers via props
- [ ] Create/edit form (si nécessaire)
- [ ] Entity select (si utilisé dans d'autres formulaires)
- [ ] Nav item dans `sidebar-data.ts`
- [ ] Labels, toasts, messages en français

````

- [ ] **Commit final phase 4**
```bash
git add .agents/skills/entity/ .agents/skills/embedded-table/ .agents/skills/entity-select/
git add .agents/skills/nextjs-list-page/ .agents/skills/nextjs-detail-sheet/ .agents/skills/nextjs-detail-page/
git add .agents/skills/shared-components/
git commit -m "feat(agents): complete all 7 skill files — phase 4 done"
````
