"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { CellActions } from "@/components/data-table/cell-actions";
import { EyeIcon, EditIcon, TrashIcon } from "@/lib/icons";

interface BuildColumnsOptions {
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function buildColumns({
  onView,
  onEdit,
  onDelete,
}: BuildColumnsOptions): ColumnDef<Role>[] {
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
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "permissions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Permissions" />
      ),
      cell: ({ row }) => {
        const count = row.original.permissions?.length ?? 0;
        return (
          <Badge variant="outline">
            {count} permission{count !== 1 ? "s" : ""}
          </Badge>
        );
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
        const role = row.original;
        return (
          <CellActions
            actions={[
              { label: "Voir", icon: EyeIcon, onClick: () => onView(role) },
              {
                label: "Modifier",
                icon: EditIcon,
                onClick: () => onEdit(role),
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
