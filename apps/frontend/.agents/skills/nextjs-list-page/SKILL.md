---
name: nextjs-list-page
description: Create a feature list page with TanStack Table data table, toolbar (search + filters), pagination, row actions dropdown, bulk actions bar, and optional card grid view. Use when building admin list/index pages for any resource (users, roles, files, webhooks, etc.) in this Next.js project.
---

# Next.js List Page

## Stack

- **TanStack Table v8** (`@tanstack/react-table`)
- **Shared components** — import from these paths:
  - `@/components/data-table` → `DataTable`, `DataTableColumnHeader`, `DataTableFacetedFilter`, `DataTableViewOptions`, `DataTableBulkActionBar`, `CellActions`
  - `@/components/page-header` → `PageHeader`
  - `@/components/status-badge` → `StatusBadge`
  - `@/components/user-avatar` → `UserAvatar`
  - `@/components/empty-state` → `EmptyState`
  - `@/components/confirm-dialog` → `ConfirmDialog`
- **Icons** — `import { XxxIcon } from "@/lib/icons"` + `<Icon icon={XxxIcon} />` from `@/components/ui/icon`
- **TanStack Query** for data fetching
- **Sonner** `toast` for feedback

## File Structure

```
features/<name>/
  index.tsx           ← Page component (exported)
  columns.tsx         ← ColumnDef<TData>[] with CellActions
  toolbar.tsx         ← Search input + DataTableFacetedFilter + DataTableViewOptions
  hooks.ts            ← useQuery/useMutation (see nextjs-api-hooks skill)
  schema.ts           ← Zod validation schemas
  types.ts            ← TypeScript interfaces
  mutate-dialog.tsx   ← Create/edit dialog (see nextjs-form-dialog skill)
```

## Quick Start

### 1. Page component (`index.tsx`)

```tsx
"use client";
import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PlusIcon } from "@/lib/icons";
import { columns } from "./columns";
import { Toolbar } from "./toolbar";
import { MutateDialog } from "./mutate-dialog";
import { useListUsers, useDeleteUser } from "./hooks";
import type { User } from "./types";

export function UsersPage() {
  const { data, isLoading } = useListUsers();
  const deleteUser = useDeleteUser();

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [mutateOpen, setMutateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage your users here."
        action={{
          label: "Add user",
          icon: PlusIcon,
          onClick: () => {
            setEditTarget(null);
            setMutateOpen(true);
          },
        }}
      />

      <DataTable
        columns={columns({
          onEdit: (user) => {
            setEditTarget(user);
            setMutateOpen(true);
          },
          onDelete: (user) => setDeleteTarget(user),
        })}
        data={data?.items ?? []}
        isLoading={isLoading}
        toolbar={(table) => <Toolbar table={table} />}
      />

      <MutateDialog
        open={mutateOpen}
        onOpenChange={setMutateOpen}
        user={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          deleteUser.mutate(deleteTarget!.id);
          setDeleteTarget(null);
        }}
        isPending={deleteUser.isPending}
      />
    </div>
  );
}
```

### 2. Columns with CellActions (`columns.tsx`)

```tsx
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import { CellActions } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { EditIcon, TrashIcon, ViewIcon } from "@/lib/icons";
import type { User } from "./types";

interface ColumnOptions {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView?: (user: User) => void;
}

export function columns({
  onEdit,
  onDelete,
  onView,
}: ColumnOptions): ColumnDef<User>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserAvatar
            name={row.original.name}
            email={row.original.email}
            size="sm"
          />
          <div>
            <p className="font-medium text-sm">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CellActions
          actions={[
            ...(onView
              ? [
                  {
                    label: "View",
                    icon: ViewIcon,
                    onClick: () => onView(row.original),
                  },
                ]
              : []),
            {
              label: "Edit",
              icon: EditIcon,
              onClick: () => onEdit(row.original),
            },
            {
              label: "Delete",
              icon: TrashIcon,
              onClick: () => onDelete(row.original),
              variant: "destructive" as const,
              separator: true,
            },
          ]}
        />
      ),
    },
  ];
}
```

### 3. Toolbar (`toolbar.tsx`)

```tsx
"use client";
import { type Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/components/data-table";
import { Icon } from "@/components/ui/icon";
import { XIcon } from "@/lib/icons";

export function Toolbar<TData>({ table }: { table: Table<TData> }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Search..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="h-8 w-[200px]"
        />
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title="Status"
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Banned", value: "banned" },
          ]}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset <Icon icon={XIcon} size={14} className="ml-1" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
```

## Bulk Actions

Pass `selectedRows` to `DataTableBulkActionBar`:

```tsx
// Inside page component, after DataTable:
{
  selectedRows.length > 0 && (
    <DataTableBulkActionBar
      selectedCount={selectedRows.length}
      onClearSelection={() => table.resetRowSelection()}
      actions={[
        {
          label: "Delete selected",
          icon: TrashIcon,
          onClick: handleBulkDelete,
          variant: "destructive",
        },
      ]}
    />
  );
}
```

## Card Grid Variant

```tsx
const [view, setView] = useState<"table" | "grid">("table")
// Toggle button in toolbar using GridIcon / ListViewIcon
{view === "table" ? (
  <DataTable ... />
) : (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
    {data?.items.map((item) => <ResourceCard key={item.id} item={item} />)}
  </div>
)}
```

## Empty State

`DataTable` shows "No results." by default. For a custom empty state, pass `emptyState` prop or check `data.length === 0` before rendering the table and show `<EmptyState>` instead.
