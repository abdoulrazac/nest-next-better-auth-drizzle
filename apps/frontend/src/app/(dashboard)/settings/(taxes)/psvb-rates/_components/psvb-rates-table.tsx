// @ts-nocheck
import { StatusBadge } from "@/components/shared";
import CellActions, {
  createDeleteAction,
  createEditAction,
} from "@/components/cell-actions";
import { Badge } from "@/components/ui/badge";
import { PSVB_GROUP_LABELS } from "@/server/api/common/schemas/psvb-rate.schema";
import { PercentCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";

export type PsvbRateRow = {
  id: string;
  label: string;
  group: string;
  rate: number;
  isDefault?: boolean;
  status?: string;
  description?: string | null;
};

interface PsvbRatesColumnsProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function psvbRatesColumns({
  onEdit,
  onDelete,
}: PsvbRatesColumnsProps): ColumnDef<any>[] {
  return [
    {
      accessorKey: "label",
      header: "Libellé",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <HugeiconsIcon icon={PercentCircleIcon} className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-sm text-foreground">
            {row.getValue("label")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "group",
      header: "Groupe",
      cell: ({ row }) => {
        const g = row.original.group as keyof typeof PSVB_GROUP_LABELS;
        return (
          <Badge variant="outline" className="font-mono">
            {g}
          </Badge>
        );
      },
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
