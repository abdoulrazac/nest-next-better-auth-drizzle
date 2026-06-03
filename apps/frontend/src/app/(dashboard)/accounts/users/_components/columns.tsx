// @ts-nocheck
"use client";

import CellActions, {
  createCancelAction,
  createDeleteAction,
  createEditAction,
  createViewAction,
} from "@/components/shared/cell-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type {
  MemberInvitationWithRelations,
  MemberWithRelations,
} from "@/types/accounts";
import {
  Shield,
  UserCheck,
  UserCog,
  UserSwitchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate, formatDistanceToNow, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

const roleConfig = {
  admin: {
    variant: "default" as const,
    icon: <HugeiconsIcon icon={Shield} className="h-3 w-3" />,
  },
  manager: {
    variant: "secondary" as const,
    icon: <HugeiconsIcon icon={UserCog} className="h-3 w-3" />,
  },
  user: {
    variant: "outline" as const,
    icon: <HugeiconsIcon icon={UserCheck} className="h-3 w-3" />,
  },
} as const;

const getBadge = (role: string) => {
  let roleKey: keyof typeof roleConfig = "user";
  if (role?.toLowerCase().includes("admin")) {
    roleKey = "admin";
  } else if (role?.toLowerCase().includes("manager")) {
    roleKey = "manager";
  }
  const config = roleConfig[roleKey];
  if (!config) return null;

  return (
    <Badge variant={config.variant} className="shrink-0">
      {config.icon} {role.toUpperCase()}
    </Badge>
  );
};

const UserLink = ({
  user,
  children,
}: {
  user: MemberWithRelations;
  children: React.ReactNode;
}) => {
  return <Link href={`/accounts/users/${user.id}`}>{children}</Link>;
};

const invitationStatusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "En attente", variant: "secondary" },
  accepted: { label: "Acceptée", variant: "default" },
  rejected: { label: "Refusée", variant: "destructive" },
  expired: { label: "Expirée", variant: "outline" },
  canceled: { label: "Annulée", variant: "destructive" },
};

export const createColumns = ({
  onUpdateUser,
  onUpdateRole,
  onRemoveUser,
}: {
  onUpdateUser?: (user: MemberWithRelations) => void;
  onUpdateRole?: (user: MemberWithRelations) => void;
  onRemoveUser?: (user: MemberWithRelations) => void;
} = {}): ColumnDef<MemberWithRelations>[] => [
  {
    accessorKey: "firstName",
    header: "Nom et Email",
    cell: ({ row }) => {
      const user = row.original.user;
      const name = user.name || "";
      const initials = name.slice(0, 2).toUpperCase();
      return (
        <div className="flex items-center gap-4">
          <UserLink user={row.original}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </UserLink>
          <div>
            <div className="font-medium">
              <UserLink user={row.original}>{name}</UserLink>
            </div>
            <div className="text-muted-foreground text-sm">
              <UserLink user={row.original}>{user.email}</UserLink>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <div>{getBadge(role || "")}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{formatDate(date, "P", { locale: fr })}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <CellActions
          actions={[
            createViewAction(`/accounts/users/${user.id}`, "Voir les détails"),
            ...(onUpdateRole
              ? [
                  {
                    tooltip: "Modifier le rôle",
                    icon: (
                      <HugeiconsIcon
                        icon={UserSwitchIcon}
                        className="h-4 w-4"
                      />
                    ),
                    onClick: () => onUpdateRole(user),
                  },
                ]
              : []),
            ...(onUpdateUser
              ? [createEditAction(() => onUpdateUser(user))]
              : []),
            ...(onRemoveUser
              ? [createDeleteAction(() => onRemoveUser(user))]
              : []),
          ]}
        />
      );
    },
  },
];

export const createInvitationColumns = (
  _onCancel?: (invitationId: string) => void,
  _onDelete?: (invitationId: string) => void,
): ColumnDef<MemberInvitationWithRelations>[] => [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <div>{getBadge(role || "")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string).toLowerCase();
      const config = invitationStatusConfig[status] ?? {
        label: status,
        variant: "outline" as const,
      };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Invité le",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="flex flex-col">
          <span>{formatDate(date, "P", { locale: fr })}</span>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(date, { locale: fr, addSuffix: true })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expire le",
    cell: ({ row }) => {
      const date = new Date(row.getValue("expiresAt"));
      const expired = isPast(date);
      return (
        <div className="flex flex-col">
          <span
            className={expired ? "text-destructive font-medium" : undefined}
          >
            {formatDate(date, "P", { locale: fr })}
          </span>
          <span
            className={`text-xs ${expired ? "text-destructive" : "text-muted-foreground"}`}
          >
            {expired
              ? `Expirée ${formatDistanceToNow(date, { locale: fr, addSuffix: true })}`
              : `Expire ${formatDistanceToNow(date, { locale: fr, addSuffix: true })}`}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invitation = row.original;
      const status = invitation.status?.toLowerCase() || "pending";

      const actionMap: Record<
        string,
        typeof CellActions.prototype.props.actions
      > = {
        pending: [
          createCancelAction(() => {
            _onCancel?.(invitation.id);
          }),
        ],
        canceled: [],
        accepted: [],
        expired: [],
      };

      return <CellActions actions={actionMap[status] || []} />;
    },
  },
];
