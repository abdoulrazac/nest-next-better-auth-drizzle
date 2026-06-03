// @ts-nocheck
import { StatusBadge } from "@/components/shared";
import CellActions, {
  createDeleteAction,
  createEditAction,
} from "@/components/shared/cell-actions";
import { Badge } from "@/components/ui/badge";
import { PercentCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";

export type TaxRateRow = {
  id: string;
  label: string;
  rate: number;
  type?: string;
  status?: string;
  isDefault?: boolean;
  taxGroup?: string | null;
};

interface TaxRatesColumnsProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function taxRatesColumns({
  onEdit,
  onDelete,
}: TaxRatesColumnsProps): ColumnDef<any>[] {
  return [
    {
      accessorKey: "label",
      header: "Nom",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/15 text-destructive">
            <HugeiconsIcon icon={PercentCircleIcon} className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-sm text-foreground">
            {row.getValue("label")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "rate",
      header: "Taux",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono">
          {Number(row.original.rate)}%
        </Badge>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        if (!type)
          return <span className="text-sm text-muted-foreground">—</span>;
        return <Badge variant="outline">{type}</Badge>;
      },
    },
    {
      accessorKey: "taxGroup",
      header: "Taxe code",
      cell: ({ row }) => {
        const g = row.original.taxGroup;
        if (!g) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <Badge variant="outline" className="font-mono">
            {g}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isDefault",
      header: "Par défaut",
      cell: ({ row }) =>
        row.original.isDefault ? (
          <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/30">
            Oui
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">Non</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status === "INACTIVE" ? "INACTIVE" : "ACTIVE"}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <CellActions
          visibleActions={1}
          actions={[
            createEditAction(() => onEdit(row.original.id)),
            createDeleteAction(() => onDelete(row.original.id)),
          ]}
        />
      ),
    },
  ];
}
