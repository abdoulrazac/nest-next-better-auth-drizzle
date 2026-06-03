// @ts-nocheck
"use client";

import PageHeader from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  ArrowRight01Icon,
  Box,
  CheckmarkCircle02Icon,
  Download,
  FileText,
  Tag,
  Upload,
  Users,
  Wallet,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImportType = useRef<string | null>(null);
  const utils = api.useUtils();

  const exportMutation = api.settings.importExport.export.useMutation();
  const importMutation = api.settings.importExport.import.useMutation();

  function downloadCsv(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const importTemplates = [
    {
      id: "clients",
      name: "Clients",
      description: "Importez votre base de données clients",
      icon: <HugeiconsIcon icon={Users} className="h-8 w-8" />,
      fields: ["Nom", "Email", "Téléphone", "Type"],
    },
    {
      id: "products",
      name: "Produits",
      description: "Importez votre catalogue de produits",
      icon: <HugeiconsIcon icon={Box} className="h-8 w-8" />,
      fields: ["Désignation", "Prix achat", "Prix vente"],
    },
    {
      id: "suppliers",
      name: "Fournisseurs",
      description: "Importez votre liste de fournisseurs",
      icon: <HugeiconsIcon icon={Wallet} className="h-8 w-8" />,
      fields: ["Dénomination", "Email", "Téléphone", "Délai paiement"],
    },
    {
      id: "categories",
      name: "Catégories",
      description: "Importez vos catégories de produits",
      icon: <HugeiconsIcon icon={Tag} className="h-8 w-8" />,
      fields: ["Nom", "Description"],
    },
  ];

  const exportOptions = [
    {
      id: "clients",
      name: "Clients",
      description: "Exporter la liste complète des clients",
      icon: <HugeiconsIcon icon={Users} className="h-8 w-8" />,
    },
    {
      id: "products",
      name: "Produits",
      description: "Exporter le catalogue de produits et stocks",
      icon: <HugeiconsIcon icon={Box} className="h-8 w-8" />,
    },
    {
      id: "invoices",
      name: "Factures",
      description: "Exporter toutes les factures",
      icon: <HugeiconsIcon icon={FileText} className="h-8 w-8" />,
    },
    {
      id: "payments",
      name: "Paiements",
      description: "Exporter l'historique des paiements",
      icon: <HugeiconsIcon icon={Wallet} className="h-8 w-8" />,
    },
    {
      id: "suppliers",
      name: "Fournisseurs",
      description: "Exporter la liste des fournisseurs",
      icon: <HugeiconsIcon icon={Wallet} className="h-8 w-8" />,
    },
  ];

  const templateMutation =
    api.settings.importExport.downloadTemplate.useMutation();

  const handleDownloadTemplate = async (templateId: string) => {
    try {
      const result = await templateMutation.mutateAsync({
        type: templateId as "clients" | "products" | "suppliers" | "categories",
      });
      downloadCsv(result.csv, result.filename);
    } catch {
      toast.error("Erreur lors du téléchargement du modèle");
    }
  };

  const handleImport = (templateId: string) => {
    activeImportType.current = templateId;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const type = activeImportType.current;
    if (!file || !type) return;

    // Reset input so same file can be re-selected
    e.target.value = "";

    if (!file.name.endsWith(".csv")) {
      toast.error("Seuls les fichiers CSV sont acceptés");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 5 Mo)");
      return;
    }

    setImportingId(type);
    try {
      const csvContent = await file.text();
      const result = await importMutation.mutateAsync({
        type: type as "clients" | "products" | "suppliers" | "categories",
        csvContent,
      });

      // Invalidate relevant caches after successful import
      if (type === "clients") void utils.sales.client.invalidate();
      else if (type === "products") void utils.purchases.product.invalidate();
      else if (type === "suppliers") void utils.purchases.supplier.invalidate();
      else if (type === "categories")
        void utils.purchases.productCategory.invalidate();

      if (result.errors?.length > 0) {
        toast.warning(
          `${result.imported}/${result.total} importés. ${result.errors.length} erreur(s).`,
        );
      } else {
        toast.success(
          `${result.imported} enregistrement(s) importé(s) avec succès`,
        );
      }
    } catch {
      toast.error("Erreur lors de l'import");
    } finally {
      setImportingId(null);
    }
  };

  const handleExport = async (optionId: string) => {
    setExportingId(optionId);
    try {
      const result = await exportMutation.mutateAsync({
        type: optionId as
          | "clients"
          | "products"
          | "suppliers"
          | "invoices"
          | "payments",
      });
      downloadCsv(result.csv, result.filename);
      toast.success("Export terminé — fichier téléchargé");
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExportingId(null);
    }
  };

  const handleFullExport = async () => {
    setIsProcessing(true);
    try {
      const types = [
        "clients",
        "products",
        "suppliers",
        "invoices",
        "payments",
      ] as const;
      for (const type of types) {
        const result = await exportMutation.mutateAsync({ type });
        downloadCsv(result.csv, result.filename);
      }
      toast.success("Export complet terminé — tous les fichiers téléchargés");
    } catch {
      toast.error("Erreur lors de l'export complet");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileSelected}
      />

      <PageHeader
        title="Import / Export"
        description="Gérer l'importation et l'exportation de vos données"
        variant="list"
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("import")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "import"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          Import
        </button>
        <button
          onClick={() => setActiveTab("export")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "export"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          Export
        </button>
      </div>

      {activeTab === "import" && (
        <div className="space-y-6">
          {/* Import Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {importTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-lg",
                        "bg-blue-50 text-blue-600",
                      )}
                    >
                      {template.icon}
                    </div>
                    <div>
                      <div className="text-lg">{template.name}</div>
                      <div className="text-sm text-slate-600">
                        {template.description}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Champs requis
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {template.fields.map((field, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDownloadTemplate(template.id)}
                    >
                      <HugeiconsIcon icon={Download} className="mr-2 h-4 w-4" />
                      Télécharger modèle
                    </Button>
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => handleImport(template.id)}
                      disabled={importingId === template.id}
                    >
                      <HugeiconsIcon icon={Upload} className="mr-2 h-4 w-4" />
                      {importingId === template.id
                        ? "Import en cours..."
                        : "Importer"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Import Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Conseils pour l'import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-5 w-5 text-green-600 shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <div className="font-medium">
                      Utilisez les modèles fournis
                    </div>
                    <div className="text-slate-600">
                      Téléchargez les modèles pour vous assurer du format
                      correct des colonnes
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-5 w-5 text-green-600 shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <div className="font-medium">
                      Vérifiez les données avant import
                    </div>
                    <div className="text-slate-600">
                      Assurez-vous que tous les champs requis sont remplis et
                      que les formats sont corrects
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-5 w-5 text-green-600 shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <div className="font-medium">Faites un import test</div>
                    <div className="text-slate-600">
                      Commencez par un petit échantillon pour vérifier que
                      l'import fonctionne correctement
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-5 w-5 text-green-600 shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <div className="font-medium">Sauvegardez avant import</div>
                    <div className="text-slate-600">
                      Faites toujours une sauvegarde de vos données avant de
                      faire un import massif
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "export" && (
        <div className="space-y-6">
          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exportOptions.map((option) => (
              <Card key={option.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-lg",
                        "bg-green-50 text-green-600",
                      )}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <div className="text-lg">{option.name}</div>
                      <div className="text-sm text-slate-600">
                        {option.description}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleExport(option.id)}
                    disabled={exportingId === option.id}
                  >
                    <HugeiconsIcon icon={Download} className="mr-2 h-4 w-4" />
                    {exportingId === option.id
                      ? "Export en cours..."
                      : "Exporter en CSV"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Export */}
          <Card>
            <CardHeader>
              <CardTitle>Export complet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Exporter toutes les données de votre organisation en un seul
                fichier. Ceci inclut :
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-4 w-4 text-green-600 shrink-0"
                  />
                  <span>Clients et fournisseurs</span>
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-4 w-4 text-green-600 shrink-0"
                  />
                  <span>Produits et catégories</span>
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-4 w-4 text-green-600 shrink-0"
                  />
                  <span>Factures et paiements</span>
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-4 w-4 text-green-600 shrink-0"
                  />
                  <span>Stock et mouvements</span>
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-4 w-4 text-green-600 shrink-0"
                  />
                  <span>Paramètres et configuration</span>
                </li>
              </ul>
              <Button
                className="w-full mt-4"
                onClick={handleFullExport}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span>Export en cours...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Download} className="mr-2 h-4 w-4" />
                    <span>Exporter toutes les données</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="ml-2 h-4 w-4"
                    />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
