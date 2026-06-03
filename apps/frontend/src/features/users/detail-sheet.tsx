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
import { StatusBadge } from "@/components/status-badge";
import { Icon } from "@/components/ui/icon";
import { EditIcon, TrashIcon } from "@/lib/icons";
import { useGetUser } from "./hooks";
import type { User } from "./types";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-pink-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

interface UserDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserDetailSheet({
  open,
  onOpenChange,
  userId,
  onEdit,
  onDelete,
}: UserDetailSheetProps) {
  const { data: user, isLoading } = useGetUser(userId, {
    enabled: open && !!userId,
  });

  const initials = user?.name?.charAt(0)?.toUpperCase() ?? "?";
  const color = user ? getAvatarColor(user.name) : "bg-muted";
  const status = user?.banned ? "banned" : "active";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] flex flex-col">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Separator />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-4 mt-4">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full text-white text-xl font-bold flex-shrink-0",
                  color,
                )}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-base truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                <div className="mt-1">
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="flex-1 divide-y">
              <DetailRow
                label="Role"
                value={
                  user.role ? <Badge variant="outline">{user.role}</Badge> : "—"
                }
              />
              <DetailRow
                label="Status"
                value={<StatusBadge status={status} />}
              />
              <DetailRow
                label="Created"
                value={new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(new Date(user.createdAt))}
              />
              <DetailRow
                label="Last updated"
                value={new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(new Date(user.updatedAt))}
              />
              <DetailRow
                label="ID"
                value={<span className="font-mono text-xs">{user.id}</span>}
              />
            </div>

            <Separator className="mt-auto" />
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(user)}
              >
                <Icon icon={EditIcon} size={14} className="mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => onDelete(user)}
              >
                <Icon icon={TrashIcon} size={14} className="mr-2" />
                Delete
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
