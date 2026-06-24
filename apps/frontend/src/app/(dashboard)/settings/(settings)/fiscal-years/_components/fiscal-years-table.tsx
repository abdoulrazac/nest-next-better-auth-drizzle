// @ts-nocheck
import CellActions, {
  createDeleteAction,
  createEditAction,
} from "@/components/cell-actions";
import { Badge } from "@/components/ui/badge";
import {
  Calendar03Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Icon } from "@/components/ui/icon";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  OPEN: { label: "Ouvert", variant: "default" },
  CLOSING: { label: "En clôture", variant: "secondary" },
  CLOSED: { label: "Clôturé", variant: "outline" },
};

interface FiscalYearColumnsProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function fiscalYearsColumns({
  onEdit,
  onDelete,
  onClose,
  onSetDefault,
}: FiscalYearColumnsProps): ColumnDef<any>[] {
  return [
    {
      accessorKey: "label",
      header: "Exercice",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-chart-3/15 text-chart-3">
            <Icon icon={Calendar03Icon} className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-sm text-foreground">
                {row.getValue("label")}
              </p>
              {row.original.isDefault && (
                <Icon
                  icon={CheckmarkBadge01Icon}
                  className="h-4 w-4 text-chart-3"
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Début",
      cell: ({ row }) =>
        format(new Date(row.getValue("startDate")), "dd MMM yyyy", {
          locale: fr,
        }),
    },
    {
      accessorKey: "endDate",
      header: "Fin",
      cell: ({ row }) =>
        format(new Date(row.getValue("endDate")), "dd MMM yyyy", {
          locale: fr,
        }),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const s = STATUS_MAP[row.getValue("status") as string] ?? {
          label: row.getValue("status"),
          variant: "outline" as const,
        };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        const isClosed = item.status === "CLOSED";
        return (
          <CellActions
            actions={[
              ...(isClosed
                ? []
                : [
                    createEditAction(() => onEdit(item.id)),
                    {
                      label: item.isDefault
                        ? "Exercice actif"
                        : "Définir comme actif",
                      onClick: () => onSetDefault(item.id),
                      disabled: item.isDefault,
                    },
                    {
                      label: "Clôturer",
                      onClick: () => onClose(item.id),
                      className: "text-chart-5",
                    },
                  ]),
              createDeleteAction(() => onDelete(item.id)),
              {
                label: "Voir le rapport",
                href: `/finance/reports/fiscal-year/${item.id}`,
              },
            ]}
          />
        );
      },
    },
  ];
}
