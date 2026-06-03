"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

function getStatusClassName(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "enabled":
    case "success":
    case "delivered":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent";
    case "inactive":
    case "disabled":
    case "pending":
      return ""; // secondary variant
    case "banned":
    case "blocked":
    case "failed":
    case "error":
      return ""; // destructive variant
    case "warning":
    case "retrying":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent";
    default:
      return ""; // outline variant
  }
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "active":
    case "enabled":
    case "success":
    case "delivered":
      return "default";
    case "inactive":
    case "disabled":
    case "pending":
      return "secondary";
    case "banned":
    case "blocked":
    case "failed":
    case "error":
      return "destructive";
    case "warning":
    case "retrying":
      return "default";
    default:
      return "outline";
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = getStatusVariant(status);
  const extraClassName = getStatusClassName(status);
  const displayText =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <Badge variant={variant} className={cn(extraClassName, className)}>
      {displayText}
    </Badge>
  );
}
