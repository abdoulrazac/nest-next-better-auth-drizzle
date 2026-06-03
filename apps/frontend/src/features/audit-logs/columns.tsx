"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table";
import type { AuditLog } from "./types";

export const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => (
      <span className="bg-muted font-mono text-xs px-2 py-0.5 rounded">
        {row.getValue("action")}
      </span>
    ),
  },
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const userId = row.getValue("userId") as string | null;
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {userId ?? "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "resource",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resource" />
    ),
    cell: ({ row }) => {
      const resource = row.getValue("resource") as string;
      return <span className="text-sm text-muted-foreground">{resource}</span>;
    },
  },
  {
    accessorKey: "resourceId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resource ID" />
    ),
    cell: ({ row }) => {
      const id = row.getValue("resourceId") as string | null;
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {id ?? "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "ipAddress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IP Address" />
    ),
    cell: ({ row }) => {
      const ip = row.getValue("ipAddress") as string | null;
      return (
        <span className="font-mono text-sm text-muted-foreground">
          {ip ?? "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(date))}
        </span>
      );
    },
  },
];
