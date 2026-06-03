---
name: nextjs-list-page
description: Create a feature list page with TanStack Table data table, toolbar (search + filters), pagination, row actions dropdown, bulk actions bar, and optional card grid view. Use when building admin list/index pages for any resource (users, roles, files, webhooks, etc.) in this Next.js project.
---

# Next.js List Page

## Stack

- **TanStack Table v8** (`@tanstack/react-table`) for table logic
- **Custom DataTable system** (`@/components/data-table/`) — `DataTable`, `DataTableColumnHeader`, `DataTableFacetedFilter`, `DataTableViewOptions`, `BulkActionBar`, `CellActions`
- **Shared components** — `PageHeader` (`@/components/page-header`), `StatusBadge` (`@/components/status-badge`), `EmptyState` (`@/components/empty-state`)
- **Icons** — always use `Icon` from `@/components/ui/icon` + barrel from `@/lib/icons`. Never import from `lucide-react`.
- **TanStack Query** for data fetching
- **Sonner** for toast notifications
- **ConfirmDialog** (`@/components/confirm-dialog`) for delete confirmations — never use `AlertDialog` directly

## File Structure

```
features/<name>/
  index.tsx           ← Page component (exported, used in app/ route)
  columns.tsx         ← ColumnDef<TData>[] with CellActions
  <name>-table.tsx    ← Table wrapper + DataTable component
  toolbar.tsx         ← Search input + filter popovers + view toggle
  hooks.ts            ← useQuery/useMutation hooks (see nextjs-api-hooks skill)
  types.ts            ← TypeScript interfaces
```

## Quick Start

### 1. Define columns (`columns.tsx`)

```tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { CellActions } from "@/components/data-table/cell-actions";
import { StatusBadge } from "@/components/status-badge";
import { Icon } from "@/components/ui/icon";
import { EditIcon, ViewIcon, Delete02Icon as TrashIcon } from "@/lib/icons";

export const columns: ColumnDef<User>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellActions
        row={row}
        actions={[
          {
            label: "View",
            icon: ViewIcon,
            onClick: (r) => onView(r.original),
          },
          {
            label: "Edit",
            icon: EditIcon,
            onClick: (r) => onEdit(r.original),
          },
          { separator: true },
          {
            label: "Delete",
            icon: TrashIcon,
            variant: "destructive",
            onClick: (r) => onDelete(r.original.id),
          },
        ]}
      />
    ),
  },
];
```

> **CellActions note**: actions are passed as an array. Use `separator: true` to add a visual divider. Pass callbacks from the parent via closure or props (see toolbar pattern below).

### 2. Main page component (`index.tsx`)

```tsx
"use client";
import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { PlusSignIcon as PlusIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { buildColumns } from "./columns";
import { Toolbar } from "./toolbar";
import { MutateUserDialog } from "./mutate-dialog";
import { useListUsers, useDeleteUser } from "./hooks";

export function UsersPage() {
  const { data, isLoading } = useListUsers();
  const deleteUser = useDeleteUser();

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns = buildColumns({
    onView: (user) => {
      /* open detail sheet */
    },
    onEdit: (user) => {
      setEditTarget(user);
      setDialogOpen(true);
    },
    onDelete: (id) => setDeleteId(id),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Manage your users here."
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditTarget(null);
              setDialogOpen(true);
            }}
          >
            <Icon icon={PlusIcon} />
            New User
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        toolbar={(table) => <Toolbar table={table} />}
      />

      <MutateUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editTarget}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete user?"
        description="This action cannot be undone."
        onConfirm={() => {
          deleteUser.mutate(deleteId!);
          setDeleteId(null);
        }}
        isPending={deleteUser.isPending}
      />
    </div>
  );
}
```

### 3. Toolbar (`toolbar.tsx`)

```tsx
"use client";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTableFacetedFilter } from "@/components/data-table/faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/view-options";
import { BulkActionBar } from "@/components/data-table/bulk-action-bar";
import { Icon } from "@/components/ui/icon";
import { Cancel01Icon as XIcon, Delete02Icon as TrashIcon } from "@/lib/icons";

interface ToolbarProps<TData> {
  table: Table<TData>;
}

export function Toolbar<TData>({ table }: ToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("name")?.setFilterValue(e.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2"
            >
              Reset <Icon icon={XIcon} className="ml-1" />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>

      {selectedRows.length > 0 && (
        <BulkActionBar
          count={selectedRows.length}
          onClear={() => table.resetRowSelection()}
          actions={[
            {
              label: "Delete selected",
              icon: TrashIcon,
              variant: "destructive",
              onClick: () => {
                /* bulk delete */
              },
            },
          ]}
        />
      )}
    </div>
  );
}
```

## Card Grid Variant

For resources like Files, add a view toggle in the toolbar:

```tsx
const [view, setView] = useState<"table" | "grid">("table")

{view === "table" ? (
  <DataTable ... />
) : (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
    {data?.items.map((item) => <FileCard key={item.id} file={item} />)}
  </div>
)}
```

## Notes

- Use `ConfirmDialog` (not `AlertDialog`) for all destructive confirmations
- Use `CellActions` for row actions — pass callbacks via `buildColumns({ onEdit, onDelete })` factory
- `StatusBadge` infers color from status string — no manual `variant` needed
- For server-side pagination: pass `manualPagination` + `pageCount` to DataTable and fetch with `page` + `pageSize`
- Always include a loading skeleton: `isLoading` prop on DataTable renders skeleton rows automatically
