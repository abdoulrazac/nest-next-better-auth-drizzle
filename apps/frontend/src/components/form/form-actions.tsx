"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface FormActionsProps {
  variant: "page" | "dialog";
  isLoading?: boolean;
  disabled?: boolean;
  submitLabel?: string;
  submitLoadingLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onReset?: () => void;
  resetLabel?: string;
}

export function FormActions({
  variant,
  isLoading = false,
  disabled = false,
  submitLabel = "Enregistrer",
  submitLoadingLabel = "Enregistrement...",
  cancelLabel = "Annuler",
  onCancel,
  onReset,
  resetLabel = "Réinitialiser",
}: FormActionsProps) {
  const isDisabled = isLoading || disabled;

  const buttons = (
    <>
      {onReset && (
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isDisabled}
        >
          {resetLabel}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isDisabled}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={isDisabled}>
        {isLoading && <Spinner className="mr-2 h-4 w-4" />}
        {isLoading ? submitLoadingLabel : submitLabel}
      </Button>
    </>
  );

  if (variant === "dialog") {
    return (
      <DialogFooter className="px-6 py-4 border-t shrink-0">
        {buttons}
      </DialogFooter>
    );
  }

  return <div className="flex items-center gap-3 justify-end">{buttons}</div>;
}
