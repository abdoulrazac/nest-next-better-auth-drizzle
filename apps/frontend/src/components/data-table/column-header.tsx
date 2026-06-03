"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { EyeOffIcon, SortAscIcon, SortDescIcon, SortIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { type Column } from "@tanstack/react-table";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-sm font-medium", className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "-ml-3 h-8 data-[state=open]:bg-accent",
              sorted ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span>{title}</span>
            {sorted === "desc" ? (
              <Icon icon={SortDescIcon} size={14} />
            ) : sorted === "asc" ? (
              <Icon icon={SortAscIcon} size={14} />
            ) : (
              <Icon icon={SortIcon} size={14} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <Icon
              icon={SortAscIcon}
              size={14}
              className="mr-2 text-muted-foreground"
            />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <Icon
              icon={SortDescIcon}
              size={14}
              className="mr-2 text-muted-foreground"
            />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <Icon
              icon={EyeOffIcon}
              size={14}
              className="mr-2 text-muted-foreground"
            />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
