// @ts-nocheck
import { StatusBadge } from "@/components/shared";
import CellActions, {
  createDeleteAction,
  createEditAction,
} from "@/components/cell-actions";
import { Badge } from "@/components/ui/badge";
import { RulerIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";

export type UnitRow = {
  id: string;
  code: string;
  name: string;
  abbreviation: string;
  status?: string;
};

interface UnitsColumnsProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function unitsColumns({
  onEdit,
  onDelete,
}: UnitsColumnsProps): ColumnDef<any>[] {
  return [
    {
      accessorKey: "name",
      header: "Unité",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-chart-2/15 text-chart-2">
            <HugeiconsIcon icon={RulerIcon} className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground">
              {row.getValue("name")}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {row.original.code ?? row.original.abbreviation}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "abbreviation",
      header: "Abréviation",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.getValue("abbreviation")}
        </Badge>
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
