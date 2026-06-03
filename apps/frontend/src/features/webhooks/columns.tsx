"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { CellActions } from "@/components/data-table/cell-actions";
import { StatusBadge } from "@/components/status-badge";
import { EyeIcon, EditIcon, TrashIcon } from "@/lib/icons";
import type { Webhook } from "./types";

interface BuildColumnsOptions {
  onView: (webhook: Webhook) => void;
  onEdit: (webhook: Webhook) => void;
  onDelete: (webhook: Webhook) => void;
}

export function buildColumns({
  onView,
  onEdit,
  onDelete,
}: BuildColumnsOptions): ColumnDef<Webhook>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "url",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="URL" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground max-w-[200px] truncate block">
          {row.original.url}
        </span>
      ),
    },
    {
      accessorKey: "events",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Events" />
      ),
      cell: ({ row }) => {
        const count = row.original.events?.length ?? 0;
        return (
          <Badge variant="secondary">
            {count} {count === 1 ? "event" : "events"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.active ? "active" : "inactive"} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date)
          return <span className="text-muted-foreground text-sm">—</span>;
        return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
          new Date(date),
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const webhook = row.original;
        return (
          <CellActions
            actions={[
              {
                label: "View",
                icon: EyeIcon,
                onClick: () => onView(webhook),
              },
              {
                label: "Edit",
                icon: EditIcon,
                onClick: () => onEdit(webhook),
              },
              {
                label: "Delete",
                icon: TrashIcon,
                onClick: () => onDelete(webhook),
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
