// @ts-nocheck
"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SequenceOutput } from "@/server/api/settings/schemas/sequence.schema";
import { api } from "@/trpc/react";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  INVOICE: "Facture",
  QUOTE: "Devis",
  SALES_ORDER: "Commande client",
  DELIVERY_NOTE: "Bon de livraison",
  PURCHASE_ORDER: "Commande fournisseur",
  RECEPTION: "Bon de réception",
  PAYMENT: "Paiement",
  EXPENSE: "Dépense",
  RECEIPT: "Reçu",
};

interface ResetCounterDialogProps {
  sequence: SequenceOutput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetCounterDialog({
  sequence,
  open,
  onOpenChange,
}: ResetCounterDialogProps) {
  const [newCounter, setNewCounter] = useState(1);
  const utils = api.useUtils();

  const resetMutation = api.settings.sequence.reset.useMutation({
    onSuccess: () => {
      toast.success("Compteur réinitialisé avec succès");
      utils.settings.sequence.getAll.invalidate();
      onOpenChange(false);
    },
    onError: (e) =>
      toast.error(e.message || "Erreur lors de la réinitialisation"),
  });

  const handleReset = () => {
    if (!sequence) return;
    resetMutation.mutate({
      sequenceId: sequence.id,
      newCounter,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Réinitialiser le compteur</DialogTitle>
          <DialogDescription>
            Réinitialisez le compteur de{" "}
            <strong>
              {DOCUMENT_TYPE_LABELS[sequence?.documentType ?? ""] ??
                sequence?.documentType}
            </strong>
            . Le compteur actuel est à <strong>{sequence?.counter ?? 0}</strong>
            .
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>Nouvelle valeur du compteur</FieldLabel>
          <Input
            type="number"
            min={0}
            value={newCounter}
            onChange={(e) => setNewCounter(parseInt(e.target.value, 10) || 0)}
          />
        </Field>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? "Réinitialisation..." : "Réinitialiser"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
