"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { GridIcon } from "@/lib/icons";
import { type Table } from "@tanstack/react-table";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  const hiddenCount = hideableColumns.filter(
    (column) => !column.getIsVisible(),
  ).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Icon icon={GridIcon} size={14} className="mr-2" />
          Colonnes
          {hiddenCount > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 leading-none">
              {hiddenCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Afficher les colonnes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map((column) => {
          const label =
            column.columnDef.meta?.label ??
            (typeof column.columnDef.header === "string"
              ? column.columnDef.header
              : column.id);
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
        {hiddenCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs px-2"
              onClick={() =>
                hideableColumns.forEach((col) => col.toggleVisibility(true))
              }
            >
              Tout afficher
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
