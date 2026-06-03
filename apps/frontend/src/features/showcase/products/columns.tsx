// apps/frontend/src/features/showcase/products/columns.tsx
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import CellActions, {
  createViewAction,
  createEditAction,
  createAction,
} from "@/components/cell-actions";
import { StatusBadge } from "@/components/status-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Product } from "./types";
import type { ProductHandlers } from "./hooks";

export function buildProductColumns(
  handlers: ProductHandlers,
): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "reference",
      header: "Référence",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.reference}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Catégorie",
    },
    {
      accessorKey: "price",
      header: "Prix",
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
      header: "Stock",
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
      header: "Statut",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <CellActions
            visibleActions={2}
            actions={[
              createViewAction(() => handlers.onView(id)),
              createEditAction(() => handlers.onEdit(id)),
              // createAction without confirmDialog — la confirmation est centralisée dans hooks.ts
              createAction(
                <HugeiconsIcon icon={TrashIcon} className="h-4 w-4" />,
                () => handlers.onDelete(id),
                {
                  tooltip: "Supprimer",
                  variant: "destructive",
                  className: "bg-background border-none",
                },
              ),
            ]}
          />
        );
      },
    },
  ];
}
