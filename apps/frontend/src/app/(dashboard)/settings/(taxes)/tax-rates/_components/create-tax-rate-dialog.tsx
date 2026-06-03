"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { TaxRateForm } from "./tax-rate-form";

interface CreateTaxRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (taxRate: { id: string; label: string; rate: number }) => void;
}

export function CreateTaxRateDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateTaxRateDialogProps) {
  const handleCreated = (taxRate: {
    id: string;
    label: string;
    rate: number;
  }) => {
    onCreated?.(taxRate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nouveau taux de TVA</DialogTitle>
          <DialogDescription>
            Renseignez les informations du taux. Les champs marqués * sont
            obligatoires.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="pr-3">
            <TaxRateForm
              formId="create-tax-rate-dialog-form"
              onCreated={handleCreated}
            />
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button type="submit" form="create-tax-rate-dialog-form">
            <HugeiconsIcon icon={Save} className="mr-1 h-4 w-4" />
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
