"use client";

import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface PageHeaderAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  loading?: boolean;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | "secondary"
    | "link";
}

interface PageHeaderProps {
  title: string;
  description?: string;
  /** "list" shows primary + secondary actions, "detail" shows back button area */
  variant?: "list" | "detail";
  backNavigation?: boolean;
  primaryAction?: PageHeaderAction;
  secondaryActions?: PageHeaderAction[];
  children?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  primaryAction,
  secondaryActions,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : (
        (primaryAction ||
          (secondaryActions && secondaryActions.length > 0)) && (
          <div className="flex items-center gap-2 shrink-0">
            {secondaryActions?.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? "outline"}
                onClick={action.onClick}
                disabled={action.loading}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                disabled={primaryAction.loading}
              >
                {primaryAction.icon}
                {primaryAction.label}
              </Button>
            )}
          </div>
        )
      )}
    </div>
  );
}

export { PageHeader };
