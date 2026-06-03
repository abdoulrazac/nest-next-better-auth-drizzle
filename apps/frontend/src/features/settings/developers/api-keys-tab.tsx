"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Icon } from "@/components/ui/icon";
import SingleSelect from "@/components/single-select";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/components/hooks/use-confirm-dialog";
import {
  AlertCircleIcon,
  CopyIcon,
  GlobeIcon,
  KeyIcon,
  PlusIcon,
  TrashIcon,
} from "@/lib/icons";
import { authClient, useSession } from "@/lib/auth-client";
import { env } from "@/env";

const EXPIRY_OPTIONS = [
  { label: "Jamais", value: "" },
  { label: "30 jours", value: String(60 * 60 * 24 * 30) },
  { label: "90 jours", value: String(60 * 60 * 24 * 90) },
  { label: "1 an", value: String(60 * 60 * 24 * 365) },
];

export function ApiKeysTab() {
  const { data: session } = useSession();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revealDialog, setRevealDialog] = useState<{
    key: string;
    name: string;
  } | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", expiresIn: "" });
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const result = await authClient.apiKey.list({
        query: {
          organizationId: session?.session?.activeOrganizationId!,
          limit: 10,
        },
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!session?.session?.activeOrganizationId,
  });

  const apiKeys = data?.apiKeys ?? [];

  const createMutation = useMutation({
    mutationFn: async (params: { name: string; expiresIn?: number }) => {
      const result = await authClient.apiKey.create({
        name: params.name,
        expiresIn: params.expiresIn,
        organizationId: session?.session?.activeOrganizationId!,
        metadata: {
          organizationId: session?.session?.activeOrganizationId!,
          userId: session?.session?.userId!,
          email: session?.user?.email ?? undefined,
          name: session?.user?.name ?? undefined,
        },
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (created) => {
      setCreateDialogOpen(false);
      setCreateForm({ name: "", expiresIn: "" });
      setRevealDialog({
        key: (created as any).key ?? "",
        name: (created as any).name ?? "Nouvelle clé",
      });
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e: Error) =>
      toast.error(e.message || "Erreur lors de la création de la clé"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const result = await authClient.apiKey.delete({ keyId });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Clé API supprimée");
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e: Error) =>
      toast.error(e.message || "Erreur lors de la suppression"),
  });

  const handleCreate = () => {
    if (!createForm.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    const expiresIn = createForm.expiresIn
      ? Number(createForm.expiresIn)
      : undefined;
    createMutation.mutate({ name: createForm.name, expiresIn });
  };

  const handleDelete = async (keyId: string, keyName: string) => {
    const ok = await confirm({
      ...confirmDialogPresets.delete,
      title: "Supprimer la clé API",
      description: `Voulez-vous vraiment supprimer la clé "${keyName}" ? Cette action est irréversible.`,
    });
    if (ok) deleteMutation.mutate(keyId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers");
  };

  const formatDate = (val: string | Date | null | undefined) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <TabsContent value="api-keys">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon icon={KeyIcon} size={20} />
                Clés API
              </CardTitle>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Icon icon={PlusIcon} size={16} />
                Nouvelle clé
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground animate-pulse">
                Chargement des clés API...
              </div>
            ) : isError ? (
              <div className="py-8 text-center">
                <p className="text-sm text-destructive mb-2">
                  {(error as Error)?.message ??
                    "Impossible de charger les clés API."}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon
                  icon={KeyIcon}
                  size={48}
                  className="mx-auto mb-4 opacity-30"
                />
                <p className="mb-2">Aucune clé API</p>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Créer une clé API
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Clé</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey: any) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">
                        {apiKey.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {apiKey.start
                            ? `${apiKey.start}••••••••`
                            : "••••••••••••••••••••"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            apiKey.enabled !== false ? "default" : "secondary"
                          }
                        >
                          {apiKey.enabled !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(apiKey.expiresAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Par{" "}
                        <span className="italic">
                          {apiKey.metadata?.["name"] ?? "—"}
                        </span>{" "}
                        le{" "}
                        <span className="italic">
                          {formatDate(apiKey.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            handleDelete(apiKey.id, apiKey.name ?? "cette clé")
                          }
                        >
                          <Icon icon={TrashIcon} size={14} />
                        </Button>
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
            <CardTitle className="flex items-center gap-2">
              <Icon icon={GlobeIcon} size={20} />
              Documentation API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base URL</span>
                <span className="text-primary">
                  {`${env.NEXT_PUBLIC_APP_URL}/api/v1`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Authentification</span>
                <span className="text-primary">Bearer &lt;API_KEY&gt;</span>
              </div>
            </div>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
              <pre>{`curl -X GET ${env.NEXT_PUBLIC_APP_URL}/api/v1/users \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json"`}</pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer une clé API</DialogTitle>
            <DialogDescription>
              La clé ne sera affichée qu&apos;une seule fois après la création.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Nom *</Label>
              <Input
                id="key-name"
                placeholder="Ma clé de production"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration</Label>
              <SingleSelect
                options={EXPIRY_OPTIONS}
                value={createForm.expiresIn}
                onValueChange={(v) =>
                  setCreateForm((p) => ({ ...p, expiresIn: v }))
                }
                placeholder="Sélectionner une durée"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal dialog */}
      <Dialog
        open={!!revealDialog}
        onOpenChange={(open) => !open && setRevealDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clé API créée</DialogTitle>
            <DialogDescription>
              Copiez votre clé maintenant. Elle ne sera plus affichée après la
              fermeture de cette fenêtre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <Icon
                icon={AlertCircleIcon}
                size={16}
                className="text-amber-600"
              />
              <AlertDescription className="text-amber-700">
                Conservez cette clé en lieu sûr. Elle ne peut pas être récupérée
                ultérieurement.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm break-all">
                {revealDialog?.key}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => copyToClipboard(revealDialog?.key ?? "")}
              >
                <Icon icon={CopyIcon} size={16} />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealDialog(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialogComponent />
    </TabsContent>
  );
}
