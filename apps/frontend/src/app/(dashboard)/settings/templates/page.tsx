// @ts-nocheck
"use client";

import { BasePage } from "@/components";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import PageHeader from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { TEMPLATE_TYPES, type TemplateType } from "@/lib/template";
import { api } from "@/trpc/react";
import { useUploadFiles } from "@better-upload/client";
import {
  CheckmarkCircle02Icon,
  Delete02Icon,
  Download02Icon,
  Edit,
  File02Icon,
  Loading03Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function TemplatesPage() {
  const [selectedType, setSelectedType] = useState<TemplateType>("INVOICE_FV");
  const [deleteTarget, setDeleteTarget] = useState<DocumentTemplate | null>(
    null,
  );
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const utils = api.useUtils();

  const { data: templates = [], isLoading } =
    api.settings.template.getAll.useQuery();

  const createTemplate = api.settings.template.create.useMutation({
    onSuccess: () => {
      void utils.settings.template.invalidate();
      toast.success("Modèle ajouté avec succès");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTemplate = api.settings.template.update.useMutation({
    onSuccess: () => {
      void utils.settings.template.invalidate();
      toast.success("Modèle mis à jour");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteTemplate = api.settings.template.delete.useMutation({
    onSuccess: () => {
      void utils.settings.template.invalidate();
      toast.success("Modèle supprimé");
    },
    onError: (err) => toast.error(err.message),
  });

  const getDownloadUrl = api.settings.template.getDownloadUrl.useMutation({
    onSuccess: ({ url }) => {
      window.open(url, "_blank");
    },
    onError: (err) => toast.error(err.message),
  });

  const uploader = useUploadFiles({
    route: "documents",
    onUploadComplete: ({ files }) => {
      if (files.length > 0 && files[0]) {
        const hasDefaultForType = templates.some(
          (t) => t.type === selectedType && t.isDefault,
        );
        createTemplate.mutate({
          name: files[0].name,
          type: selectedType,
          fileUrl: files[0].objectInfo?.key ?? files[0].name,
          isDefault: !hasDefaultForType,
        });
        setOpenUploadDialog(false);
      }
    },
    onError: (err) => {
      toast.error(`Erreur d'upload: ${err.message}`);
    },
  });

  const setAsDefault = (id: string) => {
    updateTemplate.mutate({ id, isDefault: true });
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateTemplate.mutate({ id, isActive });
  };

  const handleDownload = (id: string) => {
    getDownloadUrl.mutate({ id });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTemplate.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const columns: ColumnDef<DocumentTemplate>[] = [
    {
      header: "Nom du modèle",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={File02Icon}
            className="h-4 w-4 text-muted-foreground"
          />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }) => (
        <Badge variant="outline">
          {TEMPLATE_TYPES[row.original.type as TemplateType] ??
            row.original.type}
        </Badge>
      ),
    },
    {
      header: "Statut",
      accessorKey: "isDefault",
      cell: ({ row }) =>
        row.original.isDefault ? (
          <Badge className="bg-green-500 hover:bg-green-600">Par défaut</Badge>
        ) : (
          <Badge variant="secondary">
            {row.original.isActive ? "Actif" : "Inactif"}
          </Badge>
        ),
    },
    {
      header: "Actif",
      id: "isActive",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={(checked) => toggleActive(row.original.id, checked)}
          disabled={row.original.isDefault}
        />
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <HugeiconsIcon
            icon={File02Icon}
            className="h-4 w-4 text-muted-foreground"
          />
          Actions
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end max-w-60 gap-1">
          {!row.original.isDefault && row.original.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAsDefault(row.original.id)}
              disabled={updateTemplate.isPending}
            >
              {updateTemplate.isPending ? (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="h-4 w-4 mr-1 animate-spin"
                />
              ) : (
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="h-4 w-4 mr-1"
                />
              )}
              Par défaut
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild title="Modifier le modèle">
            <Link href={`/settings/templates/${row.original.id}/edit`}>
              <HugeiconsIcon icon={Edit} className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(row.original.id)}
            disabled={getDownloadUrl.isPending}
            title="Télécharger le modèle"
          >
            {getDownloadUrl.isPending ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                className="h-4 w-4 animate-spin"
              />
            ) : (
              <HugeiconsIcon icon={Download02Icon} className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
            disabled={deleteTemplate.isPending}
            title="Supprimer"
          >
            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <BasePage
      breadcrumbs={[
        { title: "Paramètres", url: "/settings" },
        { title: "Modèles de Documents", url: "/settings/templates" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Modèles de Documents"
          description="Gérez vos modèles d'impression HTML pour la génération de PDF"
          variant="list"
          primaryAction={{
            icon: (
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
            ),
            label: "Créer un modèle",
            href: "/settings/templates/new",
          }}
          secondaryActions={[
            {
              icon: (
                <HugeiconsIcon icon={Download02Icon} className="h-4 w-4 mr-2" />
              ),
              label: "Importer un fichier HTML",
              onClick: () => setOpenUploadDialog(true),
            },
          ]}
        />

        <div className="md:col-span-3">
          <DataTable
            columns={columns}
            data={templates}
            isLoading={isLoading}
            pagination={false}
            emptyMessage="Aucun modèle de document. Créez-en un avec l'éditeur ou importez un fichier HTML."
          />

          <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Importer un modèle HTML</DialogTitle>
                <DialogDescription>
                  Téléversez un fichier HTML contenant les balises Handlebars.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Type de document
                  </label>
                  <Select
                    value={selectedType}
                    onValueChange={(v) => setSelectedType(v as TemplateType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <UploadDropzone
                  control={uploader.control}
                  accept=".html"
                  description={{
                    fileTypes: "HTML",
                    maxFileSize: "5MB",
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Supprimer le modèle"
          description={`Êtes-vous sûr de vouloir supprimer le modèle « ${deleteTarget?.name ?? ""} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          variant="destructive"
        />
      </div>
    </BasePage>
  );
}
