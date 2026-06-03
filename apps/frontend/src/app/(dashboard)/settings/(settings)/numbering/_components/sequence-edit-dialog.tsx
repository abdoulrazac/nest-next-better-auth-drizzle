// @ts-nocheck
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import SingleSelect from "@/components/single-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { SequenceOutput } from "@/server/api/settings/schemas/sequence.schema";
import {
  updateSequenceSchema,
  type UpdateSequenceInput,
} from "@/server/api/settings/schemas/sequence.schema";
import { api } from "@/trpc/react";

const YEARLY_MANDATORY_TYPES = [
  "INVOICE",
  "INVOICE_FV",
  "INVOICE_FT",
  "INVOICE_FA",
  "INVOICE_EV",
  "INVOICE_ET",
  "INVOICE_EA",
  "QUOTE",
  "SALES_ORDER",
  "DELIVERY_NOTE",
  "PURCHASE_ORDER",
];

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

const SEPARATOR_OPTIONS = [
  { value: "-", label: "Tiret (-)" },
  { value: "/", label: "Slash (/)" },
  { value: ".", label: "Point (.)" },
  { value: "_", label: "Underscore (_)" },
];

interface SequenceEditDialogProps {
  sequence: SequenceOutput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SequenceEditDialog({
  sequence,
  open,
  onOpenChange,
}: SequenceEditDialogProps) {
  const utils = api.useUtils();

  const updateMutation = api.settings.sequence.update.useMutation({
    onSuccess: () => {
      toast.success("Séquence mise à jour avec succès");
      utils.settings.sequence.getAll.invalidate();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message || "Erreur lors de la mise à jour"),
  });

  const form = useForm<UpdateSequenceInput>({
    resolver: zodResolver(updateSequenceSchema) as any,
    defaultValues: {
      documentType: "INVOICE",
      prefix: "",
      separator: "-",
      padding: 4,
      includeYear: true,
      resetFrequency: "YEARLY",
      isActive: true,
    },
  });

  useEffect(() => {
    if (sequence) {
      form.reset({
        documentType:
          sequence.documentType as UpdateSequenceInput["documentType"],
        prefix: sequence.prefix,
        separator: sequence.separator,
        padding: sequence.padding,
        includeYear: sequence.includeYear,
        resetFrequency:
          (sequence.resetFrequency as "NEVER" | "YEARLY") ?? "NEVER",
        isActive: sequence.isActive,
      });
    }
  }, [sequence, form]);

  const watchedValues = form.watch();

  const preview = useMemo(() => {
    const prefix = watchedValues.prefix || "XXX";
    const sep = watchedValues.separator || "-";
    const year = watchedValues.includeYear
      ? new Date().getFullYear().toString()
      : "";
    const counter = "1".padStart(watchedValues.padding || 4, "0");
    return prefix + sep + (year ? year + sep : "") + counter;
  }, [
    watchedValues.prefix,
    watchedValues.separator,
    watchedValues.includeYear,
    watchedValues.padding,
  ]);

  const onSubmit = (values: UpdateSequenceInput) => {
    updateMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Modifier la séquence :{" "}
            {DOCUMENT_TYPE_LABELS[sequence?.documentType ?? ""] ??
              sequence?.documentType}
          </DialogTitle>
          <DialogDescription>
            Configurez le format de numérotation pour ce type de document.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Aperçu de la référence
            </p>
            <p className="text-lg font-mono font-semibold">{preview}</p>
          </div>

          {/* DGI warning for mandatory yearly reset types */}
          {sequence &&
            YEARLY_MANDATORY_TYPES.includes(sequence.documentType) && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                ⚠ La numérotation des documents de vente doit obligatoirement se
                réinitialiser annuellement (DGI §2.19).
              </div>
            )}

          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              {/* Prefix */}
              <Controller
                name="prefix"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Préfixe *</FieldLabel>
                    <Input {...field} placeholder="FAC" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Separator */}
              <Controller
                name="separator"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Séparateur</FieldLabel>
                    <SingleSelect
                      value={field.value ?? "-"}
                      onValueChange={field.onChange}
                      placeholder="Séparateur"
                      options={SEPARATOR_OPTIONS}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Padding */}
              <Controller
                name="padding"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nombre de chiffres</FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      max={10}
                      value={field.value ?? 4}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 4)
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Reset frequency */}
              <Controller
                name="resetFrequency"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Réinitialisation</FieldLabel>
                    <SingleSelect
                      value={field.value ?? "NEVER"}
                      onValueChange={field.onChange}
                      placeholder="Fréquence"
                      options={[
                        { value: "NEVER", label: "Jamais" },
                        { value: "YEARLY", label: "Annuelle" },
                      ]}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Include year */}
            <Controller
              name="includeYear"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel>Inclure l&apos;année</FieldLabel>
                    <FieldDescription>
                      Ajoute l&apos;année en cours dans la référence
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />

            {/* Is active */}
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel>Séquence active</FieldLabel>
                    <FieldDescription>
                      Désactiver empêche la génération automatique de références
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
