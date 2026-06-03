"use client";

import { CellActions } from "@/components/data-table/cell-actions";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  DownloadIcon,
  FileDownloadIcon,
  FileIcon,
  ImageIcon,
  TrashIcon,
} from "@/lib/icons";
import { type ColumnDef } from "@tanstack/react-table";
import type { FileRecord } from "./types";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) {
    return <Icon icon={ImageIcon} size={16} className="text-blue-500" />;
  }
  if (
    mimeType === "application/pdf" ||
    mimeType.includes("word") ||
    mimeType.includes("document")
  ) {
    return (
      <Icon icon={FileDownloadIcon} size={16} className="text-orange-500" />
    );
  }
  return <Icon icon={FileIcon} size={16} className="text-muted-foreground" />;
}

interface ColumnsOptions {
  onDelete: (id: string) => void;
}

export function getColumns({
  onDelete,
}: ColumnsOptions): ColumnDef<FileRecord>[] {
  return [
    {
      accessorKey: "filename",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileTypeIcon mimeType={row.original.mimeType} />
          <span className="truncate max-w-[200px]">
            {row.original.originalName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "mimeType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono text-xs">
          {row.original.mimeType}
        </Badge>
      ),
    },
    {
      accessorKey: "size",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatBytes(row.original.size)}
        </span>
      ),
    },
    {
      accessorKey: "uploadedBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Uploaded By" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.uploadedBy ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CellActions
          actions={[
            {
              label: "Download",
              icon: DownloadIcon,
              onClick: () => window.open(row.original.url, "_blank"),
            },
            {
              label: "Delete",
              icon: TrashIcon,
              onClick: () => onDelete(row.original.id),
              variant: "destructive",
              separator: true,
            },
          ]}
        />
      ),
    },
  ];
}
