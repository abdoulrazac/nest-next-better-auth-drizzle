"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { useCallback, useState } from "react";

type ConfirmVariant = "destructive" | "warning" | "info";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

export function useConfirmDialog() {
  const [state, setState] = useState<
    (ConfirmOptions & { resolve: (v: boolean) => void }) | null
  >(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  const ConfirmDialogComponent = state ? (
    <ConfirmDialog
      open={!!state}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      onConfirm={handleConfirm}
    />
  ) : null;

  return { confirm, ConfirmDialogComponent };
}

export const confirmDialogPresets = {
  delete: (name: string): ConfirmOptions => ({
    title: "Confirmer la suppression",
    description: `Êtes-vous sûr de vouloir supprimer ${name} ? Cette action est irréversible.`,
    confirmLabel: "Supprimer",
    variant: "destructive",
  }),
  cancel: (): ConfirmOptions => ({
    title: "Confirmer l'annulation",
    description: "Êtes-vous sûr de vouloir annuler ?",
    confirmLabel: "Annuler",
    variant: "warning",
  }),
  archive: (): ConfirmOptions => ({
    title: "Confirmer l'archivage",
    description:
      "Cet élément sera archivé et ne sera plus visible dans la liste principale.",
    confirmLabel: "Archiver",
    variant: "warning",
  }),
  restore: (): ConfirmOptions => ({
    title: "Confirmer la restauration",
    description: "Cet élément sera restauré et redeviendra actif.",
    confirmLabel: "Restaurer",
    variant: "info",
  }),
};
