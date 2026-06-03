"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/components/hooks/use-confirm-dialog";
import { EditIcon, PlusIcon, TrashIcon, WebhookIcon } from "@/lib/icons";
import {
  useListWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
} from "./hooks";
import type { WebhookResponse } from "@repo/validators/webhooks";

const webhookFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  url: z.string().url("URL invalide"),
  events: z.string().min(1, "Au moins un événement requis"),
  secret: z.string().optional(),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

interface MutateWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: WebhookResponse | null;
}

function MutateWebhookDialog({
  open,
  onOpenChange,
  webhook,
}: MutateWebhookDialogProps) {
  const isEdit = !!webhook;
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema as any) as any,
    defaultValues: { name: "", url: "", events: "", secret: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: webhook?.name ?? "",
        url: webhook?.url ?? "",
        events: webhook?.events?.join(", ") ?? "",
        secret: "",
      });
    }
  }, [open, webhook, reset]);

  const isPending = createWebhook.isPending || updateWebhook.isPending;

  async function onSubmit(values: WebhookFormValues) {
    const events = values.events
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const payload = {
      name: values.name,
      url: values.url,
      events,
      ...(values.secret ? { secret: values.secret } : {}),
    };

    if (isEdit && webhook) {
      await updateWebhook.mutateAsync({ id: webhook.id, data: payload });
    } else {
      await createWebhook.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier le webhook" : "Nouveau webhook"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wh-name">Nom</Label>
            <Input
              id="wh-name"
              placeholder="Mon webhook"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-url">URL</Label>
            <Input
              id="wh-url"
              placeholder="https://example.com/webhook"
              {...register("url")}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-events">Événements</Label>
            <Input
              id="wh-events"
              placeholder="user.created, user.deleted"
              {...register("events")}
            />
            {errors.events && (
              <p className="text-sm text-destructive">
                {errors.events.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Séparés par des virgules
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-secret">
              Secret{" "}
              <span className="text-muted-foreground font-normal">
                (optionnel)
              </span>
            </Label>
            <Input
              id="wh-secret"
              type="password"
              placeholder="Min. 16 caractères"
              {...register("secret")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Enregistrement..."
                : isEdit
                  ? "Enregistrer"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function WebhooksTab() {
  const { data, isLoading } = useListWebhooks();
  const deleteWebhook = useDeleteWebhook();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WebhookResponse | null>(null);

  const webhooks = data?.items ?? [];

  const handleDelete = async (webhook: WebhookResponse) => {
    const ok = await confirm({
      ...confirmDialogPresets.delete,
      title: "Supprimer le webhook",
      description: `Voulez-vous vraiment supprimer "${webhook.name}" ? Cette action est irréversible.`,
    });
    if (ok) deleteWebhook.mutate(webhook.id);
  };

  return (
    <TabsContent value="webhooks">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon={WebhookIcon} size={20} />
              Webhooks
            </CardTitle>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditTarget(null);
                setDialogOpen(true);
              }}
            >
              <Icon icon={PlusIcon} size={16} />
              Nouveau webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">
              Chargement des webhooks...
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon
                icon={WebhookIcon}
                size={48}
                className="mx-auto mb-4 opacity-30"
              />
              <p className="mb-2">Aucun webhook configuré</p>
              <Button
                variant="outline"
                onClick={() => {
                  setEditTarget(null);
                  setDialogOpen(true);
                }}
              >
                Créer un webhook
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Événements</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((wh) => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-medium">{wh.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                      {wh.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {wh.events.slice(0, 2).map((e) => (
                          <Badge
                            key={e}
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {e}
                          </Badge>
                        ))}
                        {wh.events.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{wh.events.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={wh.active ? "default" : "secondary"}>
                        {wh.active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setEditTarget(wh);
                            setDialogOpen(true);
                          }}
                        >
                          <Icon icon={EditIcon} size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          disabled={deleteWebhook.isPending}
                          onClick={() => handleDelete(wh)}
                        >
                          <Icon icon={TrashIcon} size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MutateWebhookDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditTarget(null);
        }}
        webhook={editTarget}
      />

      <ConfirmDialogComponent />
    </TabsContent>
  );
}
