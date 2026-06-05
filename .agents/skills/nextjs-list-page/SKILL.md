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
├── index.tsx          # List page — thin consumer
├── columns.tsx        # Column definitions factory
├── hooks.ts           # Centralised hook (data + handlers + configs)
├── schema.ts          # Zod schemas
├── types.ts           # TypeScript types (from @repo/validators)
├── detail-sheet.tsx   # Detail sheet (receives handlers via props)
└── mutate-dialog.tsx  # Create/edit dialog
```

## Step 1 — Centralised Hook (`hooks.ts`)

The hook owns everything. The detail sheet and any embedded table receive `handlers` via props — no duplicated mutations.

```tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@repo/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  useConfirmDialog,
  confirmDialogPresets,
} from "@/components/hooks/use-confirm-dialog";
import {
  executeBulkAction,
  showBulkResultToast,
} from "@/components/hooks/use-bulk-selection";
import {
  createSearchField,
  createFilterField,
  createResetButton,
  createBulkActions,
} from "@/components/table-header";
import { useTableParams } from "@/hooks/use-table-params";
import { buildEntityColumns } from "./columns";
import type { Entity } from "./types";
import { TrashIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import SingleSelect from "@/components/single-select";

export function useEntity() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // ── State URL (search + filtres + pagination) ──────────────────────────────
  // Synchronisé avec l'URL : navigation retour/avant restaure l'état exact.
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

  // État local uniquement — pas dans l'URL
  const [selectedItems, setSelectedItems] = useState<Entity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["entities", page, pageSize, search, getFilter("status")],
    queryFn: () =>
      client.entities.list({
        page,
        pageSize,
        search: search || undefined,
        status: getFilter("status") || undefined,
      }),
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
      const ok = await confirm(
        confirmDialogPresets.delete(`${selectedItems.length} éléments`),
      );
      if (!ok) return;
      const result = await executeBulkAction(selectedItems, (item) =>
        deleteMutation.mutateAsync(item.id),
      );
      showBulkResultToast(result, "Supprimés", "Erreur");
      setSelectedItems([]);
      void queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  };

  // ── Table config ───────────────────────────────────────────────────────────
  const columns = useMemo(() => buildEntityColumns(handlers), []);

  const searchConfig = createSearchField(
    search,
    setSearch, // onSearch — appelé uniquement sur Enter ou bouton, pas à chaque frappe ; setSearch auto-remet la page à 1
    { placeholder: "Rechercher..." },
  );

  const filtersConfig = [
    createFilterField(
      "status",
      <SingleSelect
        value={getFilter("status")}
        onValueChange={(v) => setFilter("status", v)} // setFilter auto-remet la page à 1
        options={[
          { value: "ACTIVE", label: "Actif" },
          { value: "INACTIVE", label: "Inactif" },
        ]}
        placeholder="Statut"
        btnClassName="min-w-28"
      />,
    ),
  ];

  const actionsConfig = [
    createResetButton(resetFilters), // remet search + filtres + page à 1 (pageSize préservé)
  ];

  const bulkActionsConfig =
    selectedItems.length > 0
      ? createBulkActions(
          selectedItems.length,
          [
            {
              label: "Supprimer",
              icon: <HugeiconsIcon icon={TrashIcon} className="h-4 w-4" />,
              onClick: handlers.onBulkDelete,
              variant: "destructive",
            },
          ],
          { onClose: () => setSelectedItems([]) },
        )
      : undefined;

  return {
    items,
    total,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedItems,
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
  };
}
```

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
            onPageSizeChange={setPageSize} // setPageSize auto-remet la page à 1
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

- [ ] `useTableParams` pour search/filtres/pagination (URL-synced) ; state UI local (`selectedItems`, `selectedId`, dialogs) reste `useState`
- [ ] `setSearch` / `setFilter` / `setPageSize` auto-resetent page à 1 — ne pas appeler `setPage(1)` manuellement
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
