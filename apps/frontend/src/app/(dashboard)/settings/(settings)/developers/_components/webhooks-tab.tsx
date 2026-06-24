// @ts-nocheck
"use client";

import { ErrorState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/hooks/use-confirm-dialog";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  CheckmarkCircle02Icon,
  Globe,
  Link01Icon,
  Plus,
  TestTube,
  Trash,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";

const AVAILABLE_EVENTS = [
  "client.created",
  "client.updated",
  "invoice.created",
  "invoice.paid",
  "invoice.overdue",
  "order.created",
  "order.delivered",
  "payment.received",
  "stock.low",
  "quote.accepted",
];

export function WebhooksTab() {
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    name: "",
    url: "",
    description: "",
    events: [] as string[],
    secret: "",
  });
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const utils = api.useUtils();

  const {
    data: webhooksData,
    isLoading: webhooksLoading,
    isError: webhooksError,
    error: webhooksErrorData,
    refetch: refetchWebhooks,
  } = api.settings.webhook.getAll.useQuery({});

  const webhooks = webhooksData?.data ?? [];

  const createWebhookMutation = api.settings.webhook.create.useMutation({
    onSuccess: () => {
      toast.success("Webhook créé avec succès");
      setWebhookDialogOpen(false);
      setWebhookForm({
        name: "",
        url: "",
        description: "",
        events: [],
        secret: "",
      });
      void utils.settings.webhook.invalidate();
    },
    onError: (e) =>
      toast.error(e.message || "Erreur lors de la création du webhook"),
  });

  const deleteWebhookMutation = api.settings.webhook.delete.useMutation({
    onSuccess: () => {
      toast.success("Webhook supprimé");
      void utils.settings.webhook.invalidate();
    },
    onError: (e) => toast.error(e.message || "Erreur lors de la suppression"),
  });

  const testWebhookMutation = api.settings.webhook.test.useMutation({
    onSuccess: (data: any) => {
      if (data?.success) {
        toast.success(`Test réussi (code ${data.statusCode})`);
      } else {
        toast.error(`Échec du test: ${data?.response ?? "Erreur"}`);
      }
    },
    onError: (e) => toast.error(e.message || "Erreur lors du test"),
  });

  const toggleEvent = (event: string) => {
    setWebhookForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const handleCreateWebhook = () => {
    if (!webhookForm.name.trim() || !webhookForm.url.trim()) {
      toast.error("Le nom et l'URL sont requis");
      return;
    }
    if (webhookForm.events.length === 0) {
      toast.error("Sélectionnez au moins un événement");
      return;
    }
    createWebhookMutation.mutate({
      name: webhookForm.name,
      url: webhookForm.url,
      description: webhookForm.description || undefined,
      events: webhookForm.events,
      secret: webhookForm.secret || undefined,
      isActive: true,
    });
  };

  return (
    <TabsContent value="webhooks">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon icon={Link01Icon} className="h-5 w-5" />
                Webhooks
              </CardTitle>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setWebhookDialogOpen(true)}
              >
                <Icon icon={Plus} className="h-4 w-4" />
                Nouveau webhook
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {webhooksLoading ? (
              <div className="py-8 text-center text-slate-500 animate-pulse">
                Chargement des webhooks...
              </div>
            ) : webhooksError ? (
              <ErrorState
                message={
                  webhooksErrorData?.message ??
                  "Impossible de charger les webhooks."
                }
                onRetry={() => refetchWebhooks()}
                compact
              />
            ) : webhooks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Icon
                  icon={Globe}
                  className="h-12 w-12 mx-auto mb-4 text-slate-300"
                />
                <p className="mb-2">Aucun webhook configuré</p>
                <Button
                  variant="outline"
                  onClick={() => setWebhookDialogOpen(true)}
                >
                  Créer un webhook
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom / URL</TableHead>
                    <TableHead>Événements</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((wh: any) => (
                    <TableRow key={wh.id}>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {wh.description ?? wh.url}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-65">
                          {wh.url}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(wh.events ?? []).slice(0, 3).map((ev: string) => (
                            <Badge
                              key={ev}
                              variant="secondary"
                              className="text-xs"
                            >
                              {ev}
                            </Badge>
                          ))}
                          {(wh.events ?? []).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{wh.events.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            wh.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700",
                          )}
                        >
                          {wh.status === "ACTIVE" ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            disabled={testWebhookMutation.isPending}
                            onClick={() =>
                              testWebhookMutation.mutate({ webhookId: wh.id })
                            }
                          >
                            <Icon icon={TestTube} className="h-3 w-3 mr-1" />
                            Tester
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            disabled={deleteWebhookMutation.isPending}
                            onClick={async () => {
                              const confirmed = await confirm({
                                ...confirmDialogPresets.delete,
                                title: "Supprimer le webhook",
                                description:
                                  "Voulez-vous vraiment supprimer ce webhook ? Cette action est irréversible.",
                              });
                              if (confirmed) {
                                deleteWebhookMutation.mutate({ id: wh.id });
                              }
                            }}
                          >
                            <Icon icon={Trash} className="h-3 w-3" />
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

        <Card>
          <CardHeader>
            <CardTitle>Événements disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AVAILABLE_EVENTS.map((ev) => (
                <div key={ev} className="flex items-center gap-2 text-sm">
                  <Icon
                    icon={CheckmarkCircle02Icon}
                    className="h-4 w-4 text-green-600 shrink-0"
                  />
                  <code className="text-slate-700">{ev}</code>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
              <pre>{`{
  "event": "invoice.paid",
  "timestamp": "2025-03-15T10:30:00Z",
  "organizationId": "org_xyz",
  "data": {
    "invoiceId": "inv_abc123",
    "reference": "FAC-2025-001",
    "amount": 50000,
    "currency": "XOF"
  }
}`}</pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
        <DialogContent className="min-w-lg">
          <DialogHeader>
            <DialogTitle>Créer un webhook</DialogTitle>
            <DialogDescription>
              Recevez des notifications en temps réel sur votre endpoint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wh-name">Nom *</Label>
              <Input
                id="wh-name"
                placeholder="Mon webhook de production"
                value={webhookForm.name}
                onChange={(e) =>
                  setWebhookForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-url">URL du endpoint *</Label>
              <Input
                id="wh-url"
                placeholder="https://exemple.com/webhook"
                value={webhookForm.url}
                onChange={(e) =>
                  setWebhookForm((p) => ({ ...p, url: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-desc">Description</Label>
              <Input
                id="wh-desc"
                placeholder="Description optionnelle"
                value={webhookForm.description}
                onChange={(e) =>
                  setWebhookForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                Événements *{" "}
                <span className="text-muted-foreground text-xs">
                  (sélectionnez au moins un)
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-1 max-h-45 overflow-y-auto border rounded p-2">
                {AVAILABLE_EVENTS.map((ev) => (
                  <label
                    key={ev}
                    className="flex items-center gap-2 text-sm cursor-pointer py-1"
                  >
                    <input
                      type="checkbox"
                      checked={webhookForm.events.includes(ev)}
                      onChange={() => toggleEvent(ev)}
                      className="rounded"
                    />
                    <code>{ev}</code>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-secret">Secret (optionnel)</Label>
              <Input
                id="wh-secret"
                placeholder="Clé secrète pour vérifier la signature (min. 16 car.)"
                value={webhookForm.secret}
                onChange={(e) =>
                  setWebhookForm((p) => ({ ...p, secret: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWebhookDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateWebhook}
              disabled={createWebhookMutation.isPending}
            >
              {createWebhookMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialogComponent />
    </TabsContent>
  );
}
