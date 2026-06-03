"use client";

import { type IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  icon?: IconSvgElement;
  onClick: () => void;
}

interface EmptyStateProps {
  icon?: IconSvgElement;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon = SearchIcon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <Icon icon={icon} size={40} className="text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button variant="outline" className="mt-4" onClick={action.onClick}>
          {action.icon && <Icon icon={action.icon} />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
