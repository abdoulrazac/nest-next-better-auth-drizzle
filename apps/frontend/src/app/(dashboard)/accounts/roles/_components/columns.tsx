// @ts-nocheck
"use client";

import CellActions, {
  createDeleteAction,
  createEditAction,
  createViewAction,
} from "@/components/cell-actions";
import { Badge } from "@/components/ui/badge";
import { Shield } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface Role {
  id: string;
  role: string;
  description?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  permission?: Record<string, string[]>;
}

interface CreateColumnsProps {
  onUpdateRole?: (role: Role) => void;
  onDeleteRole?: (role: Role) => void;
}

const getRoleBadge = (role: string) => {
  return (
    <Badge variant="default">
      <HugeiconsIcon icon={Shield} className="mr-1 h-3 w-3" />
      {role.toUpperCase()}
    </Badge>
  );
};

const RoleLink = ({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) => {
  return <Link href={`/accounts/roles/${role.id}`}>{children}</Link>;
};

const getPermissionsCount = (permissions?: Record<string, string[]>) => {
  if (!permissions || Object.keys(permissions).length === 0) return 0;
  return Object.values(permissions).flat().length;
};

const getPermissionsPreview = (permissions?: Record<string, string[]>) => {
  if (!permissions || Object.keys(permissions).length === 0)
    return "Aucune permission";

  const allPermissions = Object.entries(permissions).flatMap(
    ([resource, actions]) => actions.map((action) => `${resource}:${action}`),
  );

  const permissionLabels = allPermissions.slice(0, 2);

  if (allPermissions.length > 2) {
    permissionLabels.push(`+${allPermissions.length - 2} autres`);
  }

  return permissionLabels.join(", ");
};

export const createColumns = ({
  onUpdateRole,
  onDeleteRole,
}: CreateColumnsProps): ColumnDef<Role>[] => [
  {
    accessorKey: "role",
    header: "Rôle",
    size: 220,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="font-medium">
          <RoleLink role={row.original}>
            {getRoleBadge(row.getValue("role"))}
          </RoleLink>
        </div>
        {row.original.description && (
          <div className="text-muted-foreground text-xs truncate max-w-[200px]">
            {row.original.description}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "permission",
    header: "Permissions",
    size: 200,
    cell: ({ row }) => {
      const permissions = row.getValue("permission") as
        | Record<string, string[]>
        | undefined;
      const count = getPermissionsCount(permissions);
      const preview = getPermissionsPreview(permissions);

      return (
        <div className="flex flex-col gap-1 min-w-0">
          <Badge variant="outline" className="w-fit">
            {count} permission{count > 1 ? "s" : ""}
          </Badge>
          <div className="text-muted-foreground text-xs truncate max-w-[180px]">
            {preview}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    size: 110,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="whitespace-nowrap">
          {formatDate(date, "P", { locale: fr })}
        </div>
      );
    },
  },
  {
    id: "actions",
    size: 60,
    cell: ({ row }) => {
      const role = row.original;
      const isEditable = ["org_admin", "owner"].includes(role.role)
        ? false
        : true;
      return (
        <CellActions
          actions={[
            createViewAction(`/accounts/roles/${role.id}`, "Voir les détails"),
            ...(onUpdateRole && isEditable
              ? [
                  createEditAction(() => {
                    onUpdateRole(role);
                  }),
                ]
              : []),
            ...(onDeleteRole && isEditable
              ? [
                  createDeleteAction(() => {
                    onDeleteRole(role);
                  }),
                ]
              : []),
          ]}
        />
      );
    },
  },
];
