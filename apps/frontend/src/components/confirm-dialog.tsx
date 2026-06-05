"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, InfoIcon, TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

type ConfirmVariant = "destructive" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  { icon: IconSvgElement; bg: string; color: string }
> = {
  destructive: {
    icon: TrashIcon,
    bg: "bg-destructive/10",
    color: "text-destructive",
  },
  warning: {
    icon: AlertCircleIcon,
    bg: "bg-orange-100 dark:bg-orange-900/20",
    color: "text-orange-600",
  },
  info: {
    icon: InfoIcon,
    bg: "bg-blue-100 dark:bg-blue-900/20",
    color: "text-blue-600",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "destructive",
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const cfg = VARIANT_CONFIG[variant];

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row gap-6">
          <div
            className={cn(
              "flex h-12 w-16 items-center justify-center rounded-full",
              cfg.bg,
            )}
          >
            <HugeiconsIcon
              icon={cfg.icon}
              className={cn("h-6 w-6", cfg.color)}
            />
          </div>
          <div className="flex flex-col">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "..." : confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
