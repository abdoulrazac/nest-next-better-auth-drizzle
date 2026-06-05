"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  PlusIcon,
  RefreshIcon,
  XIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { ButtonTooltip } from "./button-tooltip";

export type PageHeaderVariant =
  | "default"
  | "list"
  | "detail"
  | "detail-card"
  | "create"
  | "edit";

export interface HeaderAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  disabled?: boolean;
  loading?: boolean;
  children?: HeaderAction[];
}

type BackNavigation =
  | boolean
  | { label?: string; href?: string; onClick?: () => void };

interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: PageHeaderVariant;
  backNavigation?: BackNavigation;
  primaryAction?: HeaderAction;
  secondaryActions?: HeaderAction[];
  status?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

function ActionButton({ action }: { action: HeaderAction }) {
  if (action.children?.length) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={action.variant ?? "outline"}
            disabled={action.disabled ?? action.loading}
          >
            {action.icon}
            {action.label}
            <HugeiconsIcon icon={ChevronDownIcon} className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {action.children.map((child, i) => (
            <DropdownMenuItem
              key={i}
              onClick={child.onClick}
              asChild={!!child.href}
            >
              {child.href ? (
                <Link href={child.href}>
                  {child.icon}
                  {child.label}
                </Link>
              ) : (
                <>
                  {child.icon}
                  {child.label}
                </>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  if (action.href) {
    return (
      <Button
        variant={action.variant ?? "default"}
        disabled={action.disabled}
        asChild
      >
        <Link href={action.href}>
          {action.icon}
          {action.label}
        </Link>
      </Button>
    );
  }
  return (
    <Button
      variant={action.variant ?? "default"}
      disabled={action.disabled ?? action.loading}
      onClick={action.onClick}
    >
      {action.icon}
      {action.label}
    </Button>
  );
}

export default function PageHeader({
  title,
  description,
  variant = "default",
  backNavigation,
  primaryAction,
  secondaryActions,
  status,
  isLoading,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (!backNavigation || backNavigation === true) {
      router.back();
    } else if (backNavigation.onClick) {
      backNavigation.onClick();
    }
  };

  const backHref =
    typeof backNavigation === "object" && backNavigation.href
      ? backNavigation.href
      : undefined;
  const showBack = !!backNavigation;
  const isDetailCard = variant === "detail-card";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isDetailCard && "rounded-xl border bg-card/50 p-4 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-row items-center gap-2">
          {showBack && (
            <ButtonTooltip
              variant="ghost"
              className="w-6 h-6 rounded-full gap-1 text-muted-foreground bg-primary/10 hover:bg-primary/20 data-[state=open]:bg-primary/20 p-1 mr-2 self-center"
              tooltipContent={
                typeof backNavigation === "object" && backNavigation.label
                  ? backNavigation.label
                  : "Retour"
              }
              {...(backHref ? { asChild: true } : { onClick: handleBack })}
            >
              {backHref ? (
                <Link href={backHref}>
                  <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4" />
                </Link>
              ) : (
                <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4" />
              )}
            </ButtonTooltip>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {status && <div>{status}</div>}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {(primaryAction || secondaryActions?.length) && (
          <div className="flex items-center gap-2 shrink-0">
            {secondaryActions?.map((a, i) => (
              <ActionButton key={i} action={a} />
            ))}
            {primaryAction && <ActionButton action={primaryAction} />}
          </div>
        )}
      </div>
    </div>
  );
}

export { PageHeader };

// ── Helpers ────────────────────────────────────────────────────────────────────

export const PageHeaderActions = {
  create(href: string, label = "Nouveau"): HeaderAction {
    return {
      label,
      icon: <HugeiconsIcon icon={PlusIcon} className="h-4 w-4" />,
      href,
      variant: "default",
    };
  },
  edit(href: string): HeaderAction {
    return {
      label: "Modifier",
      icon: <HugeiconsIcon icon={EditIcon} className="h-4 w-4" />,
      href,
      variant: "outline",
    };
  },
  save(onClick: () => void, loading = false): HeaderAction {
    return {
      label: loading ? "Enregistrement..." : "Enregistrer",
      onClick,
      loading,
      variant: "default",
    };
  },
  delete(onClick: () => void): HeaderAction {
    return {
      label: "Supprimer",
      icon: <HugeiconsIcon icon={DeleteIcon} className="h-4 w-4" />,
      onClick,
      variant: "destructive",
    };
  },
  export(onClick: () => void): HeaderAction {
    return {
      label: "Exporter",
      icon: <HugeiconsIcon icon={DownloadIcon} className="h-4 w-4" />,
      onClick,
      variant: "outline",
    };
  },
  cancel(href: string): HeaderAction {
    return {
      label: "Annuler",
      icon: <HugeiconsIcon icon={XIcon} className="h-4 w-4" />,
      href,
      variant: "ghost",
    };
  },
  refresh(onClick: () => void): HeaderAction {
    return {
      label: "Actualiser",
      icon: <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />,
      onClick,
      variant: "ghost",
    };
  },
};
