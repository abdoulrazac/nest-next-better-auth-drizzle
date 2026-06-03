"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MutateWebhookDialog } from "./mutate-dialog";
import { useGetWebhookDeliveries, useDeleteWebhook } from "./hooks";
import { EditIcon, TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Webhook } from "./types";

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: Webhook | null;
}

function formatDate(date?: Date | string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(date),
  );
}

function StatusCodeBadge({ code }: { code: number | null }) {
  if (!code) return <span className="text-muted-foreground text-xs">—</span>;
  const isSuccess = code >= 200 && code < 300;
  const isClientError = code >= 400 && code < 500;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-medium",
        isSuccess &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        isClientError &&
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        !isSuccess &&
          !isClientError &&
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      )}
    >
      {code}
    </span>
  );
}

export function WebhookDetailSheet({
  open,
  onOpenChange,
  webhook,
}: DetailSheetProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: deliveries } = useGetWebhookDeliveries(webhook?.id ?? "");
  const deleteMutation = useDeleteWebhook();

  if (!webhook) return null;

  const recentDeliveries = deliveries?.slice(0, 10) ?? [];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <SheetTitle>{webhook.name}</SheetTitle>
                <StatusBadge status={webhook.active ? "active" : "inactive"} />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Icon icon={EditIcon} size={14} className="mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Icon icon={TrashIcon} size={14} className="mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Details</h3>
              <div className="rounded-lg border divide-y">
                <div className="grid grid-cols-[120px_1fr] gap-2 px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide self-start pt-0.5">
                    URL
                  </span>
                  <span className="font-mono text-xs break-all">
                    {webhook.url}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Events
                  </span>
                  <span className="text-sm">
                    {webhook.events?.join(", ") || "—"}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Created By
                  </span>
                  <span className="text-sm">{webhook.createdBy ?? "—"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Created
                  </span>
                  <span className="text-sm">
                    {formatDate(webhook.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Recent Deliveries
              </h3>
              {recentDeliveries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No deliveries yet.
                </p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">
                          Event
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">
                          Status
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentDeliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-muted/30">
                          <td className="px-4 py-2 font-mono text-xs">
                            {delivery.event}
                          </td>
                          <td className="px-4 py-2">
                            <StatusCodeBadge code={delivery.statusCode} />
                          </td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">
                            {formatDate(delivery.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <MutateWebhookDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        webhook={webhook}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Webhook"
        description={`Are you sure you want to delete "${webhook.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(webhook.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              onOpenChange(false);
            },
          });
        }}
      />
    </>
  );
}
