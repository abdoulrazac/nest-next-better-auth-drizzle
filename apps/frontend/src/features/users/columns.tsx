"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { CellActions } from "@/components/data-table/cell-actions";
import { StatusBadge } from "@/components/status-badge";
import { EyeIcon, EditIcon, TrashIcon } from "@/lib/icons";
import type { User } from "./types";
import { cn } from "@/lib/utils";

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

/** Derive a status string from the UserResponse fields */
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
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        const initials = user.name?.charAt(0)?.toUpperCase() ?? "?";
        const color = getAvatarColor(user.name ?? "");
        return (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-semibold flex-shrink-0",
                color,
              )}
            >
              {initials}
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusBadge status={getUserStatus(row.original)} />,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const role = row.original.role;
        if (!role)
          return <span className="text-muted-foreground text-sm">—</span>;
        return <Badge variant="outline">{role}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return "—";
        return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
          new Date(date),
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <CellActions
            actions={[
              { label: "View", icon: EyeIcon, onClick: () => onView(user) },
              { label: "Edit", icon: EditIcon, onClick: () => onEdit(user) },
              {
                label: "Delete",
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
