"use client";

import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Badge } from "@/components/ui/badge";
import {
  ClockIcon,
  EditIcon,
  EyeIcon,
  LoginIcon,
  LogoutIcon,
  PlusIcon,
  TrashIcon,
} from "@/lib/icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { IconSvgElement } from "@hugeicons/react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { AuditLog } from "./types";

type ActionMeta = {
  icon: IconSvgElement;
  colorClass: string;
  label: string;
};

const ACTION_META: Record<string, ActionMeta> = {
  "user.login": {
    icon: LoginIcon,
    colorClass: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    label: "Connexion",
  },
  "user.logout": {
    icon: LogoutIcon,
    colorClass: "bg-slate-50 text-slate-600 dark:bg-slate-900/20",
    label: "Déconnexion",
  },
  "user.created": {
    icon: PlusIcon,
    colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
    label: "Création",
  },
  "user.updated": {
    icon: EditIcon,
    colorClass: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
    label: "Modification",
  },
  "user.deleted": {
    icon: TrashIcon,
    colorClass: "bg-red-50 text-red-600 dark:bg-red-900/20",
    label: "Suppression",
  },
  "role.created": {
    icon: PlusIcon,
    colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
    label: "Création",
  },
  "role.updated": {
    icon: EditIcon,
    colorClass: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
    label: "Modification",
  },
  "role.deleted": {
    icon: TrashIcon,
    colorClass: "bg-red-50 text-red-600 dark:bg-red-900/20",
    label: "Suppression",
  },
};

const DEFAULT_META: ActionMeta = {
  icon: EyeIcon,
  colorClass: "bg-slate-50 text-slate-600 dark:bg-slate-900/20",
  label: "Action",
};

const RESOURCE_LABELS: Record<string, string> = {
  users: "Utilisateurs",
  roles: "Rôles",
  "audit-logs": "Journaux",
  settings: "Paramètres",
};

export const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "createdAt",
    meta: { label: "Date" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800">
            <Icon icon={ClockIcon} className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {format(new Date(date), "dd MMM yyyy", { locale: fr })}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(date), "HH:mm:ss")}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    enableSorting: false,
    meta: { label: "Action" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      const action = row.original.action;
      const meta = ACTION_META[action] ?? DEFAULT_META;
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
              meta.colorClass,
            )}
          >
            <Icon icon={meta.icon} className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">{meta.label}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {action}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "resource",
    enableSorting: false,
    meta: { label: "Ressource" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ressource" />
    ),
    cell: ({ row }) => {
      const resource = row.original.resource;
      const resourceId = row.original.resourceId;
      return (
        <div className="min-w-0">
          <Badge variant="outline" className="font-normal">
            {RESOURCE_LABELS[resource] ?? resource}
          </Badge>
          {resourceId && (
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              #{resourceId.slice(0, 8)}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "userId",
    enableSorting: false,
    meta: { label: "Utilisateur" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Utilisateur" />
    ),
    cell: ({ row }) => {
      const userId = row.original.userId;
      if (!userId)
        return <span className="text-sm text-muted-foreground">Système</span>;
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {userId.slice(0, 12)}…
        </span>
      );
    },
  },
  {
    accessorKey: "ipAddress",
    enableSorting: false,
    meta: { label: "Adresse IP" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Adresse IP" />
    ),
    cell: ({ row }) => {
      const ip = row.original.ipAddress;
      return (
        <span className="font-mono text-sm text-muted-foreground">
          {ip ?? "—"}
        </span>
      );
    },
  },
];
