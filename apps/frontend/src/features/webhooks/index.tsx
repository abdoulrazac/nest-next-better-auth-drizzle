"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MutateWebhookDialog } from "./mutate-dialog";
import { WebhookDetailSheet } from "./detail-sheet";
import { buildColumns } from "./columns";
import { useListWebhooks, useDeleteWebhook } from "./hooks";
import { PlusIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Webhook } from "./types";

export function WebhooksPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editWebhook, setEditWebhook] = useState<Webhook | null>(null);
  const [viewWebhook, setViewWebhook] = useState<Webhook | null>(null);
  const [deleteWebhook, setDeleteWebhook] = useState<Webhook | null>(null);

  const { data, isLoading } = useListWebhooks();
  const deleteMutation = useDeleteWebhook();

  const columns = buildColumns({
    onView: (webhook) => setViewWebhook(webhook),
    onEdit: (webhook) => setEditWebhook(webhook),
    onDelete: (webhook) => setDeleteWebhook(webhook),
  });

  const webhooks = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Configure outgoing webhooks to notify external services of events."
        primaryAction={{
          label: "Add Webhook",
          icon: <HugeiconsIcon icon={PlusIcon} className="h-4 w-4" />,
          onClick: () => setCreateOpen(true),
        }}
      />

      <DataTable columns={columns} data={webhooks} isLoading={isLoading} />

      <MutateWebhookDialog open={createOpen} onOpenChange={setCreateOpen} />

      <MutateWebhookDialog
        open={!!editWebhook}
        onOpenChange={(open) => {
          if (!open) setEditWebhook(null);
        }}
        webhook={editWebhook}
      />

      <WebhookDetailSheet
        open={!!viewWebhook}
        onOpenChange={(open) => {
          if (!open) setViewWebhook(null);
        }}
        webhook={viewWebhook}
      />

      <ConfirmDialog
        open={!!deleteWebhook}
        onOpenChange={(open) => {
          if (!open) setDeleteWebhook(null);
        }}
        title="Delete Webhook"
        description={`Are you sure you want to delete "${deleteWebhook?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteWebhook) return;
          deleteMutation.mutate(deleteWebhook.id, {
            onSuccess: () => setDeleteWebhook(null),
          });
        }}
      />
    </div>
  );
}
