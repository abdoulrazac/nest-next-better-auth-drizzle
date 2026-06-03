// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SequenceOutput } from "@/server/api/settings/schemas/sequence.schema";
import { api } from "@/trpc/react";
import { Edit, RefreshIcon, SettingsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ButtonTooltip } from "@/components/button-tooltip";
import { DEFAULT_SEQUENCE_CONFIG } from "@/lib/constants";
import { ResetCounterDialog } from "./reset-counter-dialog";
import { SequenceEditDialog } from "./sequence-edit-dialog";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  INVOICE: "Facture (générique)",
  INVOICE_FV: "Facture de vente",
  INVOICE_FT: "Facture d'acompte",
  INVOICE_FA: "Facture d'avoir",
  INVOICE_EV: "Facture export",
  INVOICE_ET: "Acompte export",
  INVOICE_EA: "Avoir export",
  QUOTE: "Devis",
  SALES_ORDER: "Commande client",
  DELIVERY_NOTE: "Bon de livraison",
  PURCHASE_ORDER: "Commande fournisseur",
  RECEPTION: "Bon de réception",
  PAYMENT: "Paiement",
  EXPENSE: "Dépense",
  RECEIPT: "Reçu",
  CLIENT: "Client",
  SUPPLIER: "Fournisseur",
  PRODUCT: "Produit",
  STOCK_MOVEMENT: "Mouvement de stock",
  SUPPLIER_INVOICE: "Facture fournisseur",
  OD: "Écriture comptable",
  EMPLOYEE: "Employé",
};

const DOCUMENT_TYPE_GROUPS: Record<string, string[]> = {
  Ventes: [
    "INVOICE_FV",
    "INVOICE_FT",
    "INVOICE_FA",
    "INVOICE_EV",
    "INVOICE_ET",
    "INVOICE_EA",
    "QUOTE",
    "SALES_ORDER",
    "DELIVERY_NOTE",
  ],
  Achats: ["PURCHASE_ORDER", "RECEPTION", "SUPPLIER_INVOICE"],
  Finances: ["PAYMENT", "EXPENSE", "RECEIPT"],
  Stock: ["STOCK_MOVEMENT"],
  Référentiels: ["CLIENT", "SUPPLIER", "PRODUCT"],
  Comptabilité: ["OD"],
  "RH & Paie": ["EMPLOYEE"],
};

const SEPARATOR_OPTIONS = [
  { value: "-", label: "Tiret (-)" },
  { value: "/", label: "Slash (/)" },
  { value: ".", label: "Point (.)" },
  { value: "_", label: "Underscore (_)" },
];

function getDefaultSequences(): SequenceOutput[] {
  return Object.entries(DEFAULT_SEQUENCE_CONFIG).map(([docType, def]) => ({
    id: `default-${docType}`,
    documentType: docType,
    prefix: def.prefix,
    separator: def.separator,
    counter: 0,
    padding: def.padding,
    includeYear: def.includeYear,
    resetFrequency: def.resetFrequency,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

function buildPreview(seq: SequenceOutput): string {
  const year = seq.includeYear ? new Date().getFullYear().toString() : "";
  const counter = "1".padStart(seq.padding, "0");
  return (
    seq.prefix + seq.separator + (year ? year + seq.separator : "") + counter
  );
}

export function NumberingForm() {
  const utils = api.useUtils();
  const {
    data: sequencesData,
    isLoading,
    refetch,
  } = api.settings.sequence.getAll.useQuery({ take: 50 });

  const initMutation = api.settings.sequence.initializeDefaults.useMutation({
    onSuccess: () => {
      void utils.settings.sequence.invalidate();
      toast.success("Séquences par défaut initialisées");
    },
    onError: (e) => toast.error(e.message || "Erreur lors de l'initialisation"),
  });

  const [editingSequence, setEditingSequence] = useState<SequenceOutput | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [resetSequence, setResetSequence] = useState<SequenceOutput | null>(
    null,
  );
  const [resetOpen, setResetOpen] = useState(false);

  const defaultSequences = useMemo(() => getDefaultSequences(), []);

  const apiSequences = sequencesData?.data ?? [];
  const isUsingDefaults = apiSequences.length === 0;

  // Détecter les séquences manquantes dans le DB (ex : OD / EMPLOYEE ajoutés après l'init initiale)
  const apiDocTypes = useMemo(
    () => new Set(apiSequences.map((s) => s.documentType)),
    [apiSequences],
  );
  const hasMissingSequences = useMemo(
    () =>
      Object.keys(DEFAULT_SEQUENCE_CONFIG).some((dt) => !apiDocTypes.has(dt)),
    [apiDocTypes],
  );

  // Fusionner séquences API + placeholders par défaut pour les types manquants
  const sequences = useMemo(() => {
    if (isUsingDefaults) return defaultSequences;
    const missingDefaults = defaultSequences.filter(
      (s) => !apiDocTypes.has(s.documentType),
    );
    return [...apiSequences, ...missingDefaults];
  }, [isUsingDefaults, apiSequences, defaultSequences, apiDocTypes]);

  const sequenceMap = new Map(sequences.map((s) => [s.documentType, s]));

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {(isUsingDefaults || hasMissingSequences) && (
          <Card className="border-dashed border-amber-300 bg-amber-50/50">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {isUsingDefaults
                    ? "Séquences non initialisées"
                    : "Nouvelles séquences disponibles"}
                </p>
                <p className="text-sm text-amber-600">
                  {isUsingDefaults
                    ? "Les valeurs ci-dessous sont les paramètres par défaut. Initialisez-les pour pouvoir les personnaliser."
                    : "De nouveaux types de documents ont été ajoutés. Complétez les séquences pour les activer."}
                </p>
              </div>
              <Button
                onClick={() => initMutation.mutate()}
                disabled={initMutation.isPending}
              >
                <HugeiconsIcon icon={SettingsIcon} className="h-4 w-4 mr-2" />
                {initMutation.isPending
                  ? "Initialisation..."
                  : isUsingDefaults
                    ? "Initialiser les séquences"
                    : "Compléter les séquences"}
              </Button>
            </CardContent>
          </Card>
        )}

        {Object.entries(DOCUMENT_TYPE_GROUPS).map(([groupName, docTypes]) => {
          const groupSequences = docTypes
            .map((dt) => sequenceMap.get(dt))
            .filter(Boolean) as SequenceOutput[];

          if (groupSequences.length === 0) return null;

          return (
            <Card
              key={groupName}
              className={isUsingDefaults ? "opacity-75" : ""}
            >
              <CardHeader>
                <CardTitle className="text-base">{groupName}</CardTitle>
                <CardDescription>
                  Configuration des séquences pour les documents de{" "}
                  {groupName.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Préfixe</TableHead>
                      <TableHead>Aperçu</TableHead>
                      <TableHead className="text-center">Compteur</TableHead>
                      <TableHead className="text-center">Réinit.</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      {!isUsingDefaults && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupSequences.map((seq) => {
                      const isVirtual = seq.id.startsWith("default-");
                      return (
                        <TableRow
                          key={seq.id}
                          className={isVirtual ? "opacity-60" : ""}
                        >
                          <TableCell className="font-medium">
                            {DOCUMENT_TYPE_LABELS[seq.documentType] ??
                              seq.documentType}
                            {isVirtual && (
                              <span className="ml-2 text-xs text-amber-600">
                                (non initialisée)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                              {seq.prefix}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm text-muted-foreground">
                              {buildPreview(seq)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {seq.counter}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                seq.resetFrequency === "YEARLY"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {seq.resetFrequency === "YEARLY"
                                ? "Annuelle"
                                : "Jamais"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={seq.isActive ? "default" : "outline"}
                            >
                              {seq.isActive ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                          {!isUsingDefaults && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <ButtonTooltip
                                  tooltipContent={
                                    isVirtual
                                      ? "Initialisez d'abord les séquences"
                                      : "Modifier la séquence"
                                  }
                                  variant="ghost"
                                  size="icon"
                                  disabled={isVirtual}
                                  onClick={() => {
                                    if (!isVirtual) {
                                      setEditingSequence(seq);
                                      setEditOpen(true);
                                    }
                                  }}
                                >
                                  <HugeiconsIcon
                                    icon={Edit}
                                    className="h-4 w-4"
                                  />
                                </ButtonTooltip>
                                <ButtonTooltip
                                  tooltipContent={
                                    isVirtual
                                      ? "Initialisez d'abord les séquences"
                                      : "Réinitialiser le compteur"
                                  }
                                  variant="ghost"
                                  size="icon"
                                  disabled={isVirtual}
                                  onClick={() => {
                                    if (!isVirtual) {
                                      setResetSequence(seq);
                                      setResetOpen(true);
                                    }
                                  }}
                                >
                                  <HugeiconsIcon
                                    icon={RefreshIcon}
                                    className="h-4 w-4"
                                  />
                                </ButtonTooltip>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SequenceEditDialog
        sequence={editingSequence}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <ResetCounterDialog
        sequence={resetSequence}
        open={resetOpen}
        onOpenChange={setResetOpen}
      />
    </>
  );
}
