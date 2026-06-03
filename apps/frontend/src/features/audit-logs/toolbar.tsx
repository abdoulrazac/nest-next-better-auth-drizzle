"use client";

import * as React from "react";
import { type Table } from "@tanstack/react-table";
import { Icon } from "@/components/ui/icon";
import { SearchIcon } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/data-table";
import type { AuditLog } from "./types";

const ACTION_OPTIONS = [
  { label: "user.created", value: "user.created" },
  { label: "user.updated", value: "user.updated" },
  { label: "user.deleted", value: "user.deleted" },
  { label: "role.created", value: "role.created" },
  { label: "role.updated", value: "role.updated" },
];

interface AuditLogsToolbarProps {
  table: Table<AuditLog>;
}

export function AuditLogsToolbar({ table }: AuditLogsToolbarProps) {
  const actionColumn = table.getColumn("action");

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Icon
          icon={SearchIcon}
          size={16}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search actions..."
          value={(actionColumn?.getFilterValue() as string) ?? ""}
          onChange={(e) => actionColumn?.setFilterValue(e.target.value)}
          className="pl-8 h-8"
        />
      </div>
      {actionColumn && (
        <DataTableFacetedFilter
          column={actionColumn}
          title="Action"
          options={ACTION_OPTIONS}
        />
      )}
    </div>
  );
}
