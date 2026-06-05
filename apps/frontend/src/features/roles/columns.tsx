"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { CellActions } from "@/components/data-table/cell-actions";
import { EyeIcon, EditIcon, TrashIcon } from "@/lib/icons";
import type { OrgRole } from "./types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface BuildColumnsOptions {
  onView: (role: OrgRole) => void;
  onDelete: (role: OrgRole) => void;
}

export function buildColumns({
  onView,
  onDelete,
}: BuildColumnsOptions): ColumnDef<OrgRole>[] {
  return [
    {
      accessorKey: "role",
      meta: { label: "Nom" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <span className="font-medium">{row.original.role}</span>
        </div>
      ),
    },
    {
      accessorKey: "permission",
      enableSorting: false,
      meta: { label: "Permissions" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Permissions" />
      ),
      cell: ({ row }) => {
        const permission = row.original.permission ?? {};
        const totalActions = Object.values(permission).flat().length;
        const resourceCount = Object.keys(permission).length;
        return (
          <Badge variant="secondary">
            {resourceCount} ressource{resourceCount !== 1 ? "s" : ""} ·{" "}
            {totalActions} action{totalActions !== 1 ? "s" : ""}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      meta: { label: "Créé le" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Créé le" />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return "—";
        return (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {format(new Date(date), "dd MMM yyyy", { locale: fr })}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: function ActionsCell({ row }) {
        const router = useRouter();
        const role = row.original;
        return (
          <CellActions
            actions={[
              { label: "Voir", icon: EyeIcon, onClick: () => onView(role) },
              {
                label: "Modifier",
                icon: EditIcon,
                onClick: () => router.push(`/accounts/roles/${role.id}/edit`),
              },
              {
                label: "Supprimer",
                icon: TrashIcon,
                onClick: () => onDelete(role),
                variant: "destructive",
                separator: true,
              },
            ]}
          />
        );
      },
    },
  ];
}
