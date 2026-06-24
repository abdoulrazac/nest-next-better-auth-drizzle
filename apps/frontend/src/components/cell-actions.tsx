"use client";

import { ButtonTooltip } from "@/components/button-tooltip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CancelSquareIcon,
  CheckCircleIcon,
  CopyIcon,
  EditIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileSearchIcon,
  FolderOpenIcon,
  MoreHorizontalIcon,
  SendIcon,
  TrashIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { useState, type ReactNode } from "react";

interface CellAction {
  id?: string;
  label?: string;
  icon?: ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  className?: string;
  onClick?: () => void;
  href?: string;
  tooltip?: string;
  disabled?: boolean;
  loading?: boolean;
  confirmDialog?: {
    title?: string;
    description?: string;
    confirmLabel?: string;
    variant?: "info" | "destructive" | "warning";
    onCancel?: () => void;
  };
}

interface CellActionsProps {
  actions: CellAction[];
  align?: "start" | "center" | "end";
  orientation?: "horizontal" | "vertical";
  size?: "default" | "sm" | "icon";
  className?: string;
  hideWhenEmpty?: boolean;
  visibleActions?: number;
}

export default function CellActions({
  actions,
  align = "end",
  orientation = "horizontal",
  size = "icon",
  className,
  hideWhenEmpty = true,
  visibleActions,
}: CellActionsProps) {
  const [openDialog, setOpenDialog] = useState<{ action: CellAction } | null>(
    null,
  );

  if (hideWhenEmpty && actions.length === 0) return null;

  const directActions = visibleActions
    ? actions.slice(0, visibleActions)
    : actions;
  const dropdownActions = visibleActions ? actions.slice(visibleActions) : [];

  const handleActionClick = (action: CellAction) => {
    if (action.confirmDialog) {
      setOpenDialog({ action });
    } else if (action.onClick) {
      action.onClick();
    }
  };

  const handleConfirm = () => {
    if (openDialog) {
      openDialog.action.onClick?.();
      setOpenDialog(null);
    }
  };

  const renderAction = (action: CellAction) => {
    const content = <>{action.icon}</>;
    if (action.href) {
      return (
        <ButtonTooltip
          key={action.id}
          variant={action.variant ?? "ghost"}
          className={action.className}
          size={size}
          asChild
          tooltipContent={action.tooltip ?? ""}
          disabled={action.disabled ?? action.loading}
        >
          <Link href={action.href}>{content}</Link>
        </ButtonTooltip>
      );
    }
    return (
      <ButtonTooltip
        key={action.id}
        variant={action.variant ?? "ghost"}
        size={size}
        className={action.className}
        onClick={() => handleActionClick(action)}
        tooltipContent={action.tooltip ?? ""}
        disabled={action.disabled ?? action.loading}
      >
        {content}
      </ButtonTooltip>
    );
  };

  return (
    <>
      <ButtonGroup
        className={cn(
          "gap-1 items-center",
          align === "center" && "justify-center",
          align === "start" && "justify-start",
          align === "end" && "justify-end",
          orientation === "vertical" && "flex-col",
          className,
        )}
      >
        {directActions.map((action, i) => (
          <div key={action.id ?? i}>{renderAction(action)}</div>
        ))}
        {dropdownActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonTooltip
                variant="ghost"
                size="icon"
                tooltipContent="Plus d'actions"
              >
                <Icon icon={MoreHorizontalIcon} className="h-4 w-4" />
              </ButtonTooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dropdownActions.map((action, i) => (
                <DropdownMenuItem
                  key={action.id ?? i}
                  disabled={action.disabled ?? action.loading}
                  onClick={() => handleActionClick(action)}
                  asChild={!!action.href}
                  className={cn({
                    "text-destructive": action.variant === "destructive",
                  })}
                >
                  {action.href ? (
                    <Link href={action.href}>
                      {action.icon}
                      <span>{action.tooltip}</span>
                    </Link>
                  ) : (
                    <>
                      {action.icon}
                      <span>{action.tooltip}</span>
                    </>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </ButtonGroup>
      {openDialog?.action.confirmDialog && (
        <ConfirmDialog
          open={!!openDialog}
          onOpenChange={() => setOpenDialog(null)}
          title={openDialog.action.confirmDialog.title ?? "Confirmer l'action"}
          description={
            openDialog.action.confirmDialog.description ??
            "Êtes-vous sûr de vouloir effectuer cette action ?"
          }
          onConfirm={handleConfirm}
          confirmLabel={
            openDialog.action.confirmDialog.confirmLabel ?? "Confirmer"
          }
          variant={openDialog.action.confirmDialog.variant ?? "destructive"}
        />
      )}
    </>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function createViewAction(
  hrefOrFn: string | (() => void),
  tooltip = "Voir les détails",
): CellAction {
  return {
    icon: <Icon icon={EyeIcon} className="h-4 w-4" />,
    ...(typeof hrefOrFn === "function"
      ? { onClick: hrefOrFn }
      : { href: hrefOrFn }),
    tooltip,
    variant: "ghost",
  };
}

export function createEditAction(
  onClick: () => void,
  tooltip = "Modifier",
): CellAction {
  return {
    icon: <Icon icon={EditIcon} className="h-4 w-4" />,
    onClick,
    tooltip,
    variant: "ghost",
  };
}

export function createDeleteAction(
  onClick: () => void,
  opts?: Partial<Pick<CellAction, "confirmDialog">>,
): CellAction {
  return {
    icon: <Icon icon={TrashIcon} className="h-4 w-4" />,
    onClick,
    tooltip: "Supprimer",
    variant: "destructive",
    className: "bg-background border-none",
    confirmDialog: {
      title: "Confirmer la suppression",
      description:
        "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
      confirmLabel: "Supprimer",
      variant: "destructive",
      ...opts?.confirmDialog,
    },
  };
}

export function createCopyAction(
  onClick: () => void,
  tooltip = "Copier",
): CellAction {
  return {
    icon: <Icon icon={CopyIcon} className="h-4 w-4" />,
    onClick,
    tooltip,
    variant: "ghost",
  };
}

export function createOpenAction(
  onClick: () => void,
  tooltip = "Ouvrir",
): CellAction {
  return {
    icon: <Icon icon={FolderOpenIcon} className="h-4 w-4" />,
    onClick,
    tooltip,
    variant: "ghost",
  };
}

export function createNavigateAction(
  href: string,
  tooltip = "Voir les détails",
): CellAction {
  return {
    icon: <Icon icon={ExternalLinkIcon} className="h-4 w-4" />,
    href,
    tooltip,
    variant: "ghost",
  };
}

export function createCancelAction(
  onClick: () => void,
  tooltip = "Annuler",
): CellAction {
  return {
    icon: <Icon icon={CancelSquareIcon} className="h-4 w-4" />,
    onClick,
    tooltip,
    variant: "destructive",
    className: "bg-background border-none",
    confirmDialog: {
      title: "Confirmer l'annulation",
      description: "Êtes-vous sûr de vouloir annuler ?",
      confirmLabel: "Confirmer",
      variant: "warning",
    },
  };
}

export function createSendEmailAction(
  onClick: () => void,
  tooltip = "Envoyer par email",
): CellAction {
  return {
    icon: <Icon icon={SendIcon} className="h-4 w-4" />,
    onClick,
    tooltip,
    variant: "outline",
    confirmDialog: {
      title: "Confirmer l'envoi",
      description: "Êtes-vous sûr de vouloir envoyer cet email ?",
      confirmLabel: "Envoyer",
      variant: "info",
    },
  };
}

export function createPreviewAction(
  onClick: () => void,
  tooltip = "Aperçu du document",
): CellAction {
  return {
    icon: <Icon icon={FileSearchIcon} className="h-4 w-4" />,
    onClick,
    tooltip,
    variant: "ghost",
  };
}

export function createValidateAction(
  onClick: () => void,
  tooltip = "Valider",
): CellAction {
  return {
    icon: <Icon icon={CheckCircleIcon} className="h-4 w-4" />,
    onClick,
    tooltip,
    variant: "outline",
  };
}

export function createDuplicateAction(
  onClick: () => void,
  tooltip = "Dupliquer",
): CellAction {
  return {
    icon: <Icon icon={CopyIcon} className="h-4 w-4" />,
    onClick,
    tooltip,
    variant: "ghost",
  };
}

export function createToggleStatusAction(
  onClick: () => void,
  isActive: boolean,
  tooltip?: string,
): CellAction {
  const t = tooltip ?? (isActive ? "Désactiver" : "Activer");
  return {
    icon: <Icon icon={CheckCircleIcon} className="h-4 w-4" />,
    onClick,
    tooltip: t,
    variant: "ghost",
  };
}

export function createAction(
  icon: ReactNode,
  onClick?: () => void,
  options?: Partial<CellAction>,
): CellAction {
  return { icon, onClick, ...options };
}

// ── StandardCellActions ────────────────────────────────────────────────────────

export interface ExtraAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: CellAction["variant"];
  disabled?: boolean;
  confirm?: boolean;
}

export interface StandardCellActionsProps {
  onView?: () => void;
  viewHref?: string;
  onEdit?: () => void;
  editHref?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  extraActions?: ExtraAction[];
  align?: CellActionsProps["align"];
  visibleActions?: number;
}

export function StandardCellActions({
  onView,
  viewHref,
  onEdit,
  editHref,
  onDelete,
  deleteLabel,
  extraActions = [],
  align,
  visibleActions,
}: StandardCellActionsProps) {
  const actions: CellAction[] = [
    ...(onView || viewHref
      ? [createViewAction(viewHref ?? onView ?? "#")]
      : []),
    ...(onEdit || editHref
      ? editHref
        ? [
            {
              icon: <Icon icon={EditIcon} className="h-4 w-4" />,
              href: editHref,
              tooltip: "Modifier",
              variant: "ghost" as const,
            },
          ]
        : [createEditAction(onEdit!)]
      : []),
    ...(onDelete
      ? [
          createDeleteAction(
            onDelete,
            deleteLabel
              ? {
                  confirmDialog: {
                    description: `Êtes-vous sûr de vouloir supprimer ${deleteLabel} ? Cette action est irréversible.`,
                  },
                }
              : undefined,
          ),
        ]
      : []),
    ...extraActions.map(
      (a): CellAction => ({
        icon: a.icon,
        onClick: a.onClick,
        tooltip: a.label,
        variant: a.variant ?? "ghost",
        disabled: a.disabled,
        ...(a.confirm
          ? {
              confirmDialog: {
                title: "Confirmer",
                description: "Êtes-vous sûr ?",
                confirmLabel: a.label,
                variant: "warning" as const,
              },
            }
          : {}),
      }),
    ),
  ];
  return (
    <CellActions
      actions={actions}
      align={align}
      visibleActions={visibleActions}
    />
  );
}
