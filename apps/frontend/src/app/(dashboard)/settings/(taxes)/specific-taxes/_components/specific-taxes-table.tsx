// @ts-nocheck
import { StatusBadge } from "@/components/shared";
import CellActions, {
  createDeleteAction,
  createEditAction,
  createToggleStatusAction,
} from "@/components/cell-actions";
import { Badge } from "@/components/ui/badge";
import { TaxesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";

interface SpecificTaxColumnsProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function specificTaxesColumns({
  onEdit,
  onDelete,
  onToggleStatus,
}: SpecificTaxColumnsProps): ColumnDef<any>[] {
  return [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-chart-5/15 text-chart-5">
            <HugeiconsIcon icon={TaxesIcon} className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-sm text-foreground">
            {row.getValue("name")}
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
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CellActions
          actions={[
            createEditAction(() => onEdit(row.original.id)),
            createToggleStatusAction(
              () => onToggleStatus(row.original.id),
              row.original.status === "ACTIVE",
            ),
            createDeleteAction(() => onDelete(row.original.id)),
          ]}
        />
      ),
    },
  ];
}
