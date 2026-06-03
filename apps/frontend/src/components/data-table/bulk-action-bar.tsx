"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { XIcon } from "@/lib/icons";
import type { IconSvgElement } from "@hugeicons/react";

interface BulkAction {
  label: string;
  icon?: IconSvgElement;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface DataTableBulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
}

export function DataTableBulkActionBar({
  selectedCount,
  onClearSelection,
  actions,
}: DataTableBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted px-4 py-2">
      <span className="text-sm font-medium text-foreground">
        {selectedCount} row(s) selected
      </span>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            size="sm"
            variant={
              action.variant === "destructive" ? "destructive" : "outline"
            }
            onClick={action.onClick}
            className="h-7"
          >
            {action.icon && (
              <Icon icon={action.icon} size={14} className="mr-1.5" />
            )}
            {action.label}
          </Button>
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
        className="ml-auto h-7 text-muted-foreground"
      >
        <Icon icon={XIcon} size={14} className="mr-1.5" />
        Clear selection
      </Button>
    </div>
  );
}
