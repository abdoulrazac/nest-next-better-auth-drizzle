// @ts-nocheck
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
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  SpecificTaxFormFields,
  specificTaxDefaultValues,
  specificTaxSchema,
  type SpecificTaxFormValues,
} from "./specific-tax-form";

interface CreateSpecificTaxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (tax: { id: string; name: string; rate: number }) => void;
}

export function CreateSpecificTaxDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateSpecificTaxDialogProps) {
  const utils = api.useUtils();

  const form = useForm<SpecificTaxFormValues>({
    resolver: zodResolver(specificTaxSchema),
    defaultValues: specificTaxDefaultValues,
  });

  const createMutation = api.common.specificTax.create.useMutation({
    onSuccess: async (data: any) => {
      toast.success("Taxe spécifique créée");
      await utils.common.specificTax.invalidate();
      onCreated?.({ id: data.id, name: data.name, rate: Number(data.rate) });
      onOpenChange(false);
      form.reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (values: SpecificTaxFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="w-full sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle taxe spécifique</DialogTitle>
          <DialogDescription>
            Renseignez les informations. Les champs marqués * sont obligatoires.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="pr-3">
            <form
              id="create-specific-tax-dialog-form"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <SpecificTaxFormFields form={form} />
            </form>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onOpenChange(false);
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="create-specific-tax-dialog-form"
            disabled={createMutation.isPending}
          >
            <HugeiconsIcon icon={Save} className="h-4 w-4" />
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
