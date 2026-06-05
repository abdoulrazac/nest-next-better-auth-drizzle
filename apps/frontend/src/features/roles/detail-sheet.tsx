"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EditIcon, TrashIcon } from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { useGetRole } from "./hooks";
import type { OrgRole } from "./types";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

interface RoleDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string | null;
  handlers: {
    onDelete: (role: OrgRole) => void;
  };
}

export function RoleDetailSheet({
  open,
  onOpenChange,
  roleId,
  handlers,
}: RoleDetailSheetProps) {
  const { data: role, isLoading } = useGetRole(roleId, {
    enabled: open && !!roleId,
  });

  const permissionEntries = role?.permission
    ? Object.entries(role.permission)
    : [];
  const totalActions = permissionEntries.reduce(
    (acc, [, actions]) => acc + actions.length,
    0,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Détails du rôle</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-6 w-48" />
            <Separator />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : role ? (
          <>
            <div className="mt-4">
              <p className="text-lg font-semibold">{role.role}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {permissionEntries.length} ressource
                {permissionEntries.length !== 1 ? "s" : ""} · {totalActions}{" "}
                action{totalActions !== 1 ? "s" : ""}
              </p>
            </div>

            <Separator className="my-2" />

            <div className="flex-1 divide-y overflow-y-auto">
              {permissionEntries.length > 0 ? (
                permissionEntries.map(([resource, actions]) => (
                  <DetailRow
                    key={resource}
                    label={resource}
                    value={
                      <div className="flex flex-wrap gap-1 justify-end">
                        {actions.map((action) => (
                          <Badge
                            key={action}
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {action}
                          </Badge>
                        ))}
                      </div>
                    }
                  />
                ))
              ) : (
                <DetailRow
                  label="Permissions"
                  value={<span className="text-muted-foreground">Aucune</span>}
                />
              )}

              <DetailRow
                label="Créé le"
                value={
                  role.createdAt
                    ? format(new Date(role.createdAt), "dd MMM yyyy", {
                        locale: fr,
                      })
                    : "—"
                }
              />
              {role.updatedAt && (
                <DetailRow
                  label="Mis à jour le"
                  value={format(new Date(role.updatedAt), "dd MMM yyyy", {
                    locale: fr,
                  })}
                />
              )}
              <DetailRow
                label="ID"
                value={<span className="font-mono text-xs">{role.id}</span>}
              />
            </div>

            <Separator className="mt-auto" />
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/accounts/roles/${role.id}/edit`}>
                  <Icon icon={EditIcon} size={14} className="mr-2" />
                  Modifier
                </Link>
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handlers.onDelete(role)}
              >
                <Icon icon={TrashIcon} size={14} className="mr-2" />
                Supprimer
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
