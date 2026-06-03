"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Clock,
  Delete02Icon,
  Edit,
  FileExportIcon,
  Login,
  Logout,
  PlusSignCircleIcon,
  PrinterIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface AuditLogRow {
  id: string;
  userId: string | null;
  module: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string;
  severity: string;
  changedFields: string[];
  createdAt: Date;
  user?: { id: string; name: string } | null;
}

const ACTION_ICONS: Record<string, typeof Login> = {
  LOGIN: Login,
  LOGOUT: Logout,
  CREATE: PlusSignCircleIcon,
  UPDATE: Edit,
  DELETE: Delete02Icon,
  EXPORT: FileExportIcon,
  PRINT: PrinterIcon,
  VIEW: ViewIcon,
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "bg-blue-50 text-blue-600",
  LOGOUT: "bg-slate-50 text-slate-600",
  CREATE: "bg-emerald-50 text-emerald-600",
  UPDATE: "bg-amber-50 text-amber-600",
  DELETE: "bg-red-50 text-red-600",
  EXPORT: "bg-purple-50 text-purple-600",
  PRINT: "bg-indigo-50 text-indigo-600",
  VIEW: "bg-cyan-50 text-cyan-600",
};

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  EXPORT: "Export",
  PRINT: "Impression",
  VIEW: "Consultation",
};

const SEVERITY_STYLES: Record<string, { className: string }> = {
  INFO: { className: "bg-blue-50 text-blue-700 border-blue-200" },
  WARNING: { className: "bg-amber-50 text-amber-700 border-amber-200" },
  CRITICAL: { className: "bg-red-50 text-red-700 border-red-200" },
};

const SEVERITY_LABELS: Record<string, string> = {
  INFO: "Information",
  WARNING: "Avertissement",
  CRITICAL: "Critique",
};

const MODULE_LABELS: Record<string, string> = {
  auth: "Authentification",
  sales: "Ventes",
  purchases: "Achats",
  inventory: "Inventaire",
  settings: "Paramètres",
  accounts: "Comptes",
  finance: "Finance",
};

interface AuditColumnsProps {
  hideUserColumn?: boolean;
}

export function auditColumns({
  hideUserColumn,
}: AuditColumnsProps = {}): ColumnDef<AuditLogRow>[] {
  const columns: ColumnDef<AuditLogRow>[] = [];

  columns.push(
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return (
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <HugeiconsIcon icon={Clock} className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">
                {format(new Date(date), "dd MMM yyyy", { locale: fr })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(date), "HH:mm:ss", { locale: fr })}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const action = row.original.action;
        const Icon = ACTION_ICONS[action] ?? ViewIcon;
        const colorClass =
          ACTION_COLORS[action] ?? "bg-slate-50 text-slate-600";
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                colorClass,
              )}
            >
              <HugeiconsIcon icon={Icon} className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-medium">
              {ACTION_LABELS[action] ?? action}
            </span>
          </div>
        );
      },
    },
  );

  if (!hideUserColumn) {
    columns.push({
      id: "user",
      header: "Utilisateur",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return <span className="text-sm text-muted-foreground">Système</span>;
        }
        const initials = user.name
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join("");
        return (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 uppercase">
              {initials}
            </span>
            <span className="text-sm">{user.name}</span>
          </div>
        );
      },
    });
  }

  columns.push(
    {
      accessorKey: "module",
      header: "Module",
      cell: ({ row }) => {
        const mod = row.original.module;
        return (
          <Badge variant="outline" className="font-normal capitalize">
            {MODULE_LABELS[mod] ?? mod}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.original.description;
        const entityType = row.original.entityType;
        const changedFields = row.original.changedFields;

        return (
          <div className="min-w-0 max-w-xs">
            <p className="text-sm text-slate-700 truncate">{description}</p>
            {entityType && (
              <p className="text-xs text-muted-foreground">
                {entityType}
                {row.original.entityId && (
                  <span className="ml-1 font-mono text-[10px]">
                    #{row.original.entityId.slice(0, 8)}
                  </span>
                )}
              </p>
            )}
            {changedFields.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {changedFields.slice(0, 3).map((field) => (
                  <Badge
                    key={field}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {field}
                  </Badge>
                ))}
                {changedFields.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    +{changedFields.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "severity",
      header: "Sévérité",
      cell: ({ row }) => {
        const severity = row.original.severity;
        const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.INFO!;
        return (
          <Badge variant="outline" className={cn(style?.className)}>
            {severity === "CRITICAL" && (
              <HugeiconsIcon icon={AlertCircle} className="mr-1 h-3 w-3" />
            )}
            {SEVERITY_LABELS[severity] ?? severity}
          </Badge>
        );
      },
    },
  );

  return columns;
}
