"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { EditIcon, TrashIcon } from "@/lib/icons";
import { useGetRole } from "./hooks";
import type { Role } from "./types";

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
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
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleDetailSheet({
  open,
  onOpenChange,
  roleId,
  onEdit,
  onDelete,
}: RoleDetailSheetProps) {
  const { data: role, isLoading } = useGetRole(roleId, {
    enabled: open && !!roleId,
  });

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
              <p className="text-lg font-semibold">{role.name}</p>
            </div>

            <Separator className="my-2" />

            <div className="flex-1 divide-y overflow-y-auto">
              <DetailRow
                label="Permissions"
                value={
                  role.permissions && role.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {role.permissions.map((p) => (
                        <Badge
                          key={p}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Aucune</span>
                  )
                }
              />
              <DetailRow
                label="Nombre de permissions"
                value={
                  <Badge variant="secondary">
                    {role.permissions?.length ?? 0}
                  </Badge>
                }
              />
              <DetailRow
                label="Créé le"
                value={
                  role.createdAt
                    ? new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                      }).format(new Date(role.createdAt))
                    : "—"
                }
              />
              <DetailRow
                label="ID"
                value={<span className="font-mono text-xs">{role.id}</span>}
              />
            </div>

            <Separator className="mt-auto" />
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(role)}
              >
                <Icon icon={EditIcon} size={14} className="mr-2" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => onDelete(role)}
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
