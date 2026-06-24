"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "secondary";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
  icon?: IconSvgElement;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<string, { variant: StatusVariant; label: string }> =
  {
    ACTIVE: { variant: "success", label: "Actif" },
    INACTIVE: { variant: "secondary", label: "Inactif" },
    DRAFT: { variant: "secondary", label: "Brouillon" },
    PENDING: { variant: "warning", label: "En attente" },
    VALIDATED: { variant: "success", label: "Validé" },
    CANCELLED: { variant: "destructive", label: "Annulé" },
    PAID: { variant: "success", label: "Payé" },
    PARTIALLY_PAID: { variant: "warning", label: "Partiellement payé" },
    SENT: { variant: "info", label: "Envoyé" },
    ACCEPTED: { variant: "success", label: "Accepté" },
    REFUSED: { variant: "destructive", label: "Refusé" },
    EXPIRED: { variant: "destructive", label: "Expiré" },
    IN_PREPARATION: { variant: "warning", label: "En préparation" },
    PARTIALLY_DELIVERED: { variant: "warning", label: "Partiellement livré" },
    DELIVERED: { variant: "success", label: "Livré" },
    INVOICED: { variant: "info", label: "Facturé" },
    IN_PROGRESS: { variant: "info", label: "En cours" },
    PARTIAL: { variant: "warning", label: "Partiel" },
    PARTIALLY_RECEIVED: { variant: "warning", label: "Partiellement reçu" },
    RECEIVED: { variant: "success", label: "Reçu" },
    COMPLETED: { variant: "success", label: "Terminé" },
    ENABLED: { variant: "success", label: "Activé" },
    DISABLED: { variant: "secondary", label: "Désactivé" },
  };

const VARIANT_COLORS: Record<StatusVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
  warning:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  destructive: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  secondary: "bg-muted text-muted-foreground",
};

const DOT_COLORS: Record<StatusVariant, string> = {
  default: "bg-muted-foreground",
  success: "bg-emerald-500",
  warning: "bg-orange-500",
  destructive: "bg-red-500",
  info: "bg-blue-500",
  secondary: "bg-muted-foreground",
};

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusBadge({
  status,
  variant,
  className,
  icon,
  showDot,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const resolvedVariant: StatusVariant =
    variant ?? config?.variant ?? "default";
  const label = config?.label ?? formatStatusLabel(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_COLORS[resolvedVariant],
        className,
      )}
    >
      {showDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            DOT_COLORS[resolvedVariant],
          )}
        />
      )}
      {icon && <Icon icon={icon} className="h-3 w-3" />}
      {label}
    </span>
  );
}
