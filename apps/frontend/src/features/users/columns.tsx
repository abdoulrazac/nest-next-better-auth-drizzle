"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { CellActions } from "@/components/data-table/cell-actions";
import { StatusBadge } from "@/components/status-badge";
import { EyeIcon, EditIcon, TrashIcon } from "@/lib/icons";
import type { User } from "./types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-pink-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getUserStatus(user: User): "active" | "banned" {
  return user.banned ? "banned" : "active";
}

interface BuildColumnsOptions {
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function buildColumns({
  onView,
  onEdit,
  onDelete,
}: BuildColumnsOptions): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      meta: { label: "Nom" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        const color = getAvatarColor(user.name ?? "");
        return (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
                color,
              )}
            >
              {getInitials(user.name ?? "?")}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      enableSorting: false,
      meta: { label: "Statut" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Statut" />
      ),
      cell: ({ row }) => <StatusBadge status={getUserStatus(row.original)} />,
    },
    {
      accessorKey: "role",
      meta: { label: "Rôle" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rôle" />
      ),
      cell: ({ row }) => {
        const role = row.original.role;
        if (!role)
          return <span className="text-muted-foreground text-sm">—</span>;
        return <Badge variant="outline">{role}</Badge>;
      },
    },
    {
      accessorKey: "emailVerified",
      enableSorting: false,
      meta: { label: "Email vérifié" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email vérifié" />
      ),
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.emailVerified ? "ACTIVE" : "PENDING"}
          variant={row.original.emailVerified ? "success" : "warning"}
        />
      ),
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
      cell: ({ row }) => {
        const user = row.original;
        return (
          <CellActions
            actions={[
              { label: "Voir", icon: EyeIcon, onClick: () => onView(user) },
              {
                label: "Modifier",
                icon: EditIcon,
                onClick: () => onEdit(user),
              },
              {
                label: "Supprimer",
                icon: TrashIcon,
                onClick: () => onDelete(user),
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
