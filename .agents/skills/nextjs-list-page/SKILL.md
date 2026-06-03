---
name: nextjs-list-page
description: Create a feature list page with TanStack Table data table, toolbar (search + filters), pagination, row actions dropdown, bulk actions bar, and optional card grid view. Use when building admin list/index pages for any resource (users, roles, files, webhooks, etc.) in this Next.js project.
---

# Next.js List Page

## Stack

- **TanStack Table v8** (`@tanstack/react-table`) for table logic
- **DataTable** — `@/components/data-table/data-table` (supports `selectable`, `pagination`, `emptyMessage`, `onRowClick`)
- **CellActions** — `@/components/cell-actions` (default export + factory functions)
- **PageHeader** — `@/components/page-header` (default export, use `primaryAction`/`secondaryActions`)
- **TableHeader** — `@/components/table-header` (search, filters, bulk actions bar)
- **StatusBadge** — `@/components/status-badge`
- **ConfirmDialog** — `@/components/confirm-dialog` (never use `AlertDialog` directly)
- **Icons** — `import { XxxIcon } from "@/lib/icons"` + `<HugeiconsIcon icon={XxxIcon} className="h-4 w-4" />`
- **TanStack Query** for data fetching — see `nextjs-api-hooks` skill
- **Sonner** `toast` for feedback — UI labels and toasts in **French**

## File Structure

```
features/<name>/
  index.tsx         ← Page component (exported, used in app/ route)
  columns.tsx       ← ColumnDef<TData>[] with CellActions
  hooks.ts          ← useQuery/useMutation (see nextjs-api-hooks skill)
  types.ts          ← TypeScript interfaces
  mutate-dialog.tsx ← Create/edit dialog (see nextjs-form-dialog skill)
```

---

## Quick Start

### 1. Page component (`index.tsx`)

```tsx
"use client";
import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import PageHeader, { PageHeaderActions } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { buildColumns } from "./columns";
import { MutateDialog } from "./mutate-dialog";
import { useListUsers, useDeleteUser } from "./hooks";
import { toast } from "sonner";
import type { User } from "./types";

export function UsersPage() {
  const { data, isLoading } = useListUsers();
  const deleteUser = useDeleteUser();

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [mutateOpen, setMutateOpen] = useState(false);

  const columns = buildColumns({
    onEdit: (user) => {
      setEditTarget(user);
      setMutateOpen(true);
    },
    onDelete: (user) => setDeleteTarget(user),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Gérez les utilisateurs de l'application."
        primaryAction={PageHeaderActions.create(
          "/users/new",
          "Nouvel utilisateur",
        )}
        // or with onClick:
        // primaryAction={{ label: "Nouvel utilisateur", icon: <HugeiconsIcon icon={PlusIcon} className="h-4 w-4" />, onClick: () => { setEditTarget(null); setMutateOpen(true); } }}
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        selectable
        emptyMessage="Aucun utilisateur trouvé."
      />

      <MutateDialog
        open={mutateOpen}
        onOpenChange={setMutateOpen}
        user={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Supprimer ${deleteTarget?.name} ?`}
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => {
          await deleteUser.mutateAsync(deleteTarget!.id);
          toast.success("Utilisateur supprimé");
          setDeleteTarget(null);
        }}
        isPending={deleteUser.isPending}
      />
    </div>
  );
}
```

### 2. Columns with CellActions (`columns.tsx`)

Use factory functions from `@/components/cell-actions`:

```tsx
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import {
  createViewAction,
  createEditAction,
  createDeleteAction,
  StandardCellActions,
} from "@/components/cell-actions";
import { StatusBadge } from "@/components/status-badge";
import type { User } from "./types";

interface ColumnOptions {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView?: (user: User) => void;
}

export function buildColumns({
  onEdit,
  onDelete,
  onView,
}: ColumnOptions): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <StandardCellActions
          onView={onView ? () => onView(row.original) : undefined}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original)}
          deleteLabel={`l'utilisateur ${row.original.name}`}
        />
      ),
    },
  ];
}
```

Or use `CellActions` directly with full control:

```tsx
import CellActions, { createEditAction, createDeleteAction } from "@/components/cell-actions";

cell: ({ row }) => (
  <CellActions
    visibleActions={2}
    actions={[
      createViewAction(() => onView(row.original)),
      createEditAction(() => onEdit(row.original)),
      createDeleteAction(() => onDelete(row.original), {
        confirmDialog: { description: `Supprimer ${row.original.name} ?` },
      }),
    ]}
  />
),
```

### 3. Toolbar with TableHeader (`toolbar.tsx`)

Simple approach using `TableHeader`:

```tsx
"use client";
import TableHeader, {
  createSearchField,
  createResetButton,
} from "@/components/table-header";
import type { Table } from "@tanstack/react-table";

export function Toolbar<TData>({
  table,
  search,
  onSearch,
}: {
  table: Table<TData>;
  search: string;
  onSearch: (v: string) => void;
}) {
  return (
    <TableHeader
      search={createSearchField(search, onSearch, {
        placeholder: "Rechercher un utilisateur...",
      })}
      actions={[
        createResetButton(() => {
          onSearch("");
          table.resetColumnFilters();
        }),
      ]}
    />
  );
}
```

Or with TanStack Table native filtering (more integrated):

```tsx
"use client";
import { type Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTableFacetedFilter } from "@/components/data-table/faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/view-options";
import { HugeiconsIcon } from "@hugeicons/react";
import { XIcon } from "@/lib/icons";

export function Toolbar<TData>({ table }: { table: Table<TData> }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Rechercher..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="h-8 w-[200px]"
        />
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title="Statut"
          options={[
            { label: "Actif", value: "ACTIVE" },
            { label: "Inactif", value: "INACTIVE" },
          ]}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Réinitialiser{" "}
            <HugeiconsIcon icon={XIcon} className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
```

---

## Bulk Actions

Use `TableHeader` with `bulkActions` config:

```tsx
import TableHeader, { createBulkActions } from "@/components/table-header";
import { HugeiconsIcon } from "@hugeicons/react";
import { TrashIcon } from "@/lib/icons";

const selectedRows = table.getFilteredSelectedRowModel().rows;

<TableHeader
  bulkActions={createBulkActions(
    selectedRows.length,
    [
      {
        label: "Supprimer",
        icon: <HugeiconsIcon icon={TrashIcon} className="h-4 w-4" />,
        onClick: handleBulkDelete,
        variant: "destructive",
      },
    ],
    { onClose: () => table.resetRowSelection() },
  )}
/>;
```

---

## Card Grid Variant

```tsx
const [view, setView] = useState<"table" | "grid">("table");

{
  view === "table" ? (
    <DataTable
      columns={columns}
      data={items}
      isLoading={isLoading}
      selectable
    />
  ) : (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ResourceCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

---

## PageHeaderActions helpers

```tsx
import PageHeader, { PageHeaderActions } from "@/components/page-header";

// Shortcuts for common actions:
PageHeaderActions.create("/resource/new"); // → "Nouveau" button with PlusIcon
PageHeaderActions.create("/resource/new", "Ajouter");
PageHeaderActions.refresh(() => refetch()); // → "Actualiser"
PageHeaderActions.export(() => handleExport()); // → "Exporter"
```

---

## Notes

- All UI labels, placeholders, toasts → **French**
- `PageHeader` default export — import as `import PageHeader from "@/components/page-header"`
- `CellActions` default export — import as `import CellActions from "@/components/cell-actions"`
- `DataTable` named export — `import { DataTable } from "@/components/data-table/data-table"`
- `confirmDialog` inline in `CellAction` auto-spawns `ConfirmDialog` — no need to manage dialog state in columns
- `DataTable` `selectable` prop injects checkbox column automatically
- `StatusBadge` infers color from status string — no manual `variant` needed in most cases
