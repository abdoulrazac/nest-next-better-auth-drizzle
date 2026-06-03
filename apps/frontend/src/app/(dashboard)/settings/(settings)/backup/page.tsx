// @ts-nocheck
"use client";

import { ButtonTooltip } from "@/components/button-tooltip";
import { ErrorState, TableLoadingState } from "@/components/shared";
import PageHeader from "@/components/shared/page-header";
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
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/hooks/use-confirm-dialog";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  AlertTriangle,
  Calendar,
  CheckmarkCircle02Icon,
  CloudUpload,
  DatabaseRestoreIcon,
  Download,
  HardDrive,
  Refresh,
  Trash,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function BackupPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupName, setBackupName] = useState("");

  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const utils = api.useUtils();

  const {
    data: backupsData,
    isLoading,
    isError,
    error,
    refetch,
  } = api.settings.backup.getAll.useQuery({});

  const backups = (backupsData?.data || []) as any[];
  const hasInProgress = backups.some((b: any) => b.status === "IN_PROGRESS");
  const prevStatusRef = useRef<Record<string, string>>({});

  // Polling: auto-refetch every 3s while any backup is IN_PROGRESS
  useEffect(() => {
    if (!hasInProgress) return;
    const interval = setInterval(() => refetch(), 3000);
    return () => clearInterval(interval);
  }, [hasInProgress, refetch]);

  // Notify when a backup transitions from IN_PROGRESS to COMPLETED/ERROR
  useEffect(() => {
    const prev = prevStatusRef.current;
    for (const b of backups) {
      if (prev[b.id] === "IN_PROGRESS" && b.status === "COMPLETED") {
        toast.success(`Sauvegarde "${b.name}" terminée avec succès`);
      } else if (prev[b.id] === "IN_PROGRESS" && b.status === "ERROR") {
        toast.error(`Sauvegarde "${b.name}" échouée`);
      }
    }
    prevStatusRef.current = Object.fromEntries(
      backups.map((b: any) => [b.id, b.status]),
    );
  }, [backups]);

  const createMutation = api.settings.backup.create.useMutation({
    onSuccess: () => {
      toast.info("Sauvegarde lancée. Le traitement est en cours...");
      setCreateDialogOpen(false);
      setBackupName("");
      void utils.settings.backup.invalidate();
    },
    onError: (e) =>
      toast.error(e.message || "Erreur lors de la création de la sauvegarde"),
  });

  const restoreMutation = api.settings.backup.restore.useMutation({
    onSuccess: () => {
      toast.success("Sauvegarde restaurée avec succès");
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
      void utils.settings.backup.invalidate();
    },
    onError: (e) =>
      toast.error(
        e.message || "Erreur lors de la restauration de la sauvegarde",
      ),
  });

  const downloadMutation = api.settings.backup.download.useMutation({
    onSuccess: (data) => {
      if (data?.url) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    },
    onError: (e) =>
      toast.error(
        e.message || "Erreur lors du téléchargement de la sauvegarde",
      ),
  });

  const deleteMutation = api.settings.backup.delete.useMutation({
    onSuccess: () => {
      toast.success("Sauvegarde supprimée avec succès");
      void utils.settings.backup.invalidate();
    },
    onError: (e) =>
      toast.error(
        e.message || "Erreur lors de la suppression de la sauvegarde",
      ),
  });

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      toast.error("Veuillez entrer un nom pour la sauvegarde");
      return;
    }
    createMutation.mutate({ name: backupName, type: "MANUAL" });
  };

  const handleDownloadBackup = (backupId: string) => {
    downloadMutation.mutate({ backupId });
  };

  const handleRestoreBackup = () => {
    if (!selectedBackup) return;
    restoreMutation.mutate({ backupId: selectedBackup });
  };

  const handleDeleteBackup = async (backupId: string) => {
    const confirmed = await confirm(
      confirmDialogPresets.delete("cette sauvegarde"),
    );
    if (confirmed) {
      deleteMutation.mutate({ backupId });
    }
  };

  const { data: statsData } = api.settings.backup.getStats.useQuery(undefined, {
    staleTime: 30_000,
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const stats = {
    totalBackups: backups.length,
    storageUsed: formatSize(statsData?.totalSize ?? 0),
    lastBackup: statsData?.latestBackup?.createdAt ?? null,
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Sauvegarde"
          description="Gérer les sauvegardes de vos données"
          variant="list"
          primaryAction={{
            label: "Nouvelle sauvegarde",
            onClick: () => setCreateDialogOpen(true),
          }}
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 text-blue-600">
                  <HugeiconsIcon icon={HardDrive} className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">
                    Total sauvegardes
                  </div>
                  <div className="text-2xl font-bold">{stats.totalBackups}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-50 text-purple-600">
                  <HugeiconsIcon icon={HardDrive} className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Stockage utilisé</div>
                  <div className="text-lg font-semibold">
                    {stats.storageUsed}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-50 text-green-600">
                  <HugeiconsIcon icon={Calendar} className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">
                    Dernière sauvegarde
                  </div>
                  <div className="text-lg font-semibold">
                    {stats.lastBackup
                      ? new Date(stats.lastBackup).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Jamais"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-50 text-amber-600">
                  <HugeiconsIcon icon={Refresh} className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Sauvegarde auto</div>
                  <Badge className="bg-green-100 text-green-700">
                    Activée (quotidien)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backups Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des sauvegardes</CardTitle>
          </CardHeader>
          <CardContent>
            {isError ? (
              <ErrorState
                message={
                  error?.message ?? "Impossible de charger les sauvegardes."
                }
                onRetry={() => refetch()}
                compact
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <TableLoadingState />
                      </TableCell>
                    </TableRow>
                  ) : backups.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Aucune sauvegarde disponible
                      </TableCell>
                    </TableRow>
                  ) : (
                    backups.map((backup: any) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">
                          {backup.name}
                        </TableCell>
                        <TableCell>
                          {new Date(backup.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </TableCell>
                        <TableCell>
                          {backup.status === "IN_PROGRESS"
                            ? "..."
                            : backup.size
                              ? formatSize(Number(backup.size))
                              : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className={cn(
                              backup.status === "COMPLETED"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : backup.status === "ERROR"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-amber-100 text-amber-700 border-amber-200",
                            )}
                          >
                            <HugeiconsIcon
                              icon={
                                backup.status === "COMPLETED"
                                  ? CheckmarkCircle02Icon
                                  : backup.status === "ERROR"
                                    ? AlertTriangle
                                    : Refresh
                              }
                              className="h-3 w-3 mr-1"
                            />
                            {backup.status === "COMPLETED"
                              ? "Complète"
                              : backup.status === "ERROR"
                                ? "Échouée"
                                : "En cours"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <ButtonTooltip
                              tooltipContent="Télécharger cette sauvegarde"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              disabled={
                                backup.status !== "COMPLETED" ||
                                downloadMutation.isPending
                              }
                              onClick={() => handleDownloadBackup(backup.id)}
                            >
                              <HugeiconsIcon
                                icon={Download}
                                className="h-4 w-4"
                              />
                            </ButtonTooltip>
                            <ButtonTooltip
                              tooltipContent="Restaurer cette sauvegarde"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              disabled={backup.status !== "COMPLETED"}
                              onClick={() => {
                                setSelectedBackup(backup.id);
                                setRestoreDialogOpen(true);
                              }}
                            >
                              <HugeiconsIcon
                                icon={DatabaseRestoreIcon}
                                className="h-4 w-4"
                              />
                            </ButtonTooltip>
                            <ButtonTooltip
                              tooltipContent="Supprimer cette sauvegarde"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-destructive"
                              disabled={backup.status === "IN_PROGRESS"}
                              onClick={() => handleDeleteBackup(backup.id)}
                            >
                              <HugeiconsIcon icon={Trash} className="h-4 w-4" />
                            </ButtonTooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Backup Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une sauvegarde</DialogTitle>
              <DialogDescription>
                Sauvegarder toutes les données de votre organisation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom de la sauvegarde *</Label>
                <Input
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="Ex: Sauvegarde 2025-03-15"
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <HugeiconsIcon
                  icon={CloudUpload}
                  className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
                />
                <div className="text-sm">
                  <div className="font-medium text-blue-900">
                    Inclus dans la sauvegarde
                  </div>
                  <div className="text-blue-700">
                    Toutes les données clients, produits, factures, paiements,
                    stocks, et paramètres
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleCreateBackup}
                disabled={createMutation.isPending || !backupName.trim()}
              >
                {createMutation.isPending
                  ? "Sauvegarde en cours..."
                  : "Sauvegarder"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Restore Backup Dialog */}
        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restaurer une sauvegarde</DialogTitle>
              <DialogDescription>
                Restaurer les données à partir d'une sauvegarde existante
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <HugeiconsIcon
                  icon={AlertTriangle}
                  className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
                />
                <div className="text-sm">
                  <div className="font-medium text-amber-900">Attention</div>
                  <div className="text-amber-700">
                    La restauration remplacera toutes les données actuelles.
                    Cette action est irréversible.
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRestoreDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleRestoreBackup}
                disabled={restoreMutation.isPending}
              >
                {restoreMutation.isPending
                  ? "Restauration en cours..."
                  : "Restaurer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ConfirmDialogComponent />
    </>
  );
}
