// apps/frontend/src/features/showcase/products/columns.tsx
"use client";

import CellActions, {
  createDeleteAction,
  createEditAction,
  createViewAction,
} from "@/components/cell-actions";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import type { ProductHandlers } from "./hooks";
import type { Product } from "./types";

export function buildProductColumns(
  handlers: ProductHandlers,
): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "reference",
      enableSorting: false,
      meta: { label: "Référence" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Référence" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.reference}
        </span>
      ),
    },
    {
      accessorKey: "name",
      meta: { label: "Nom" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      meta: { label: "Catégorie" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Catégorie" />
      ),
    },
    {
      accessorKey: "price",
      meta: { label: "Prix" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Prix" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      meta: { label: "Stock" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => (
        <span
          className={cn(
            "tabular-nums font-medium",
            row.original.stock === 0 && "text-destructive",
          )}
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: "status",
      enableSorting: false,
      meta: { label: "Statut" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Statut" />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <CellActions
            visibleActions={2}
            actions={[
              createViewAction(() => handlers.onView(id)),
              createEditAction(() => handlers.onEdit(id)),
              createDeleteAction(() => handlers.onDelete(id)),
            ]}
          />
        );
      },
    },
  ];
}
