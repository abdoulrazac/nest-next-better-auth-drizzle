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
import { MoreVerticalIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { IconSvgElement } from "@hugeicons/react";

interface CellAction {
  label: string;
  icon?: IconSvgElement;
  onClick: () => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

interface CellActionsProps {
  actions: CellAction[];
}

export function CellActions({ actions }: CellActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icon icon={MoreVerticalIcon} size={16} />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <div key={`${action.label}-${index}`}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={cn(
                action.variant === "destructive" &&
                  "text-destructive focus:text-destructive",
              )}
            >
              {action.icon && (
                <Icon icon={action.icon} size={14} className="mr-2" />
              )}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
