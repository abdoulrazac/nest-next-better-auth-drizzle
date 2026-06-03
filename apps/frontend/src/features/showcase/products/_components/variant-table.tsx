// apps/frontend/src/features/showcase/products/_components/variant-table.tsx
"use client";

import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/status-badge";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import * as mockStore from "../mock-store";
import type { Variant } from "../types";

const VARIANT_COLUMNS: ColumnDef<Variant>[] = [
  {
    accessorKey: "name",
    header: "Variante",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.sku}
      </span>
    ),
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
];

interface VariantTableProps {
  productId: string;
}

export function VariantTable({ productId }: VariantTableProps) {
  const variants = mockStore.getVariantsByProductId(productId);

  return (
    <DataTable
      columns={VARIANT_COLUMNS}
      data={variants}
      pagination={false}
      emptyMessage="Aucune variante pour ce produit."
    />
  );
}
