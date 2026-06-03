"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, XIcon, RefreshIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

// ── Types ───────────────────────────────────────────────────────────────────────

export interface SearchField {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export interface FilterField {
  id: string;
  component: ReactNode;
}

export interface ActionButton {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  tooltip?: string;
}

export interface BulkAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export interface BulkActionsConfig {
  selectedCount: number;
  countLabel?: string;
  onClose: () => void;
  actions: BulkAction[];
}

interface TableHeaderProps {
  search?: SearchField;
  filters?: FilterField[];
  actions?: ActionButton[];
  bulkActions?: BulkActionsConfig;
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TableHeader({
  search,
  filters,
  actions,
  bulkActions,
  spacing = "md",
  className,
}: TableHeaderProps) {
  const isBulk = bulkActions && bulkActions.selectedCount > 0;

  const gapClass = { sm: "gap-2", md: "gap-3", lg: "gap-4" }[spacing];

  if (isBulk) {
    return (
      <div
        className={cn(
          "flex items-center rounded-lg border bg-muted/50 px-3 py-2",
          gapClass,
          className,
        )}
      >
        <Badge variant="secondary" className="shrink-0">
          {bulkActions.selectedCount}{" "}
          {bulkActions.countLabel ?? "sélectionné(s)"}
        </Badge>
        <div className="flex flex-1 items-center gap-2">
          {bulkActions.actions.map((a, i) => (
            <Button
              key={i}
              variant={a.variant === "destructive" ? "destructive" : "outline"}
              size="sm"
              onClick={a.onClick}
            >
              {a.icon}
              {a.label}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={bulkActions.onClose}>
          <HugeiconsIcon icon={XIcon} className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center", gapClass, className)}>
      {search && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <HugeiconsIcon
            icon={SearchIcon}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? "Rechercher..."}
            className="pl-9"
          />
        </div>
      )}
      {filters?.map((f) => (
        <div key={f.id}>{f.component}</div>
      ))}
      {actions?.map((a, i) => (
        <Button
          key={i}
          variant={a.variant ?? "outline"}
          size="sm"
          onClick={a.onClick}
        >
          {a.icon}
          {a.label}
        </Button>
      ))}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function createSearchField(
  value: string,
  onChange: (v: string) => void,
  opts?: { placeholder?: string },
): SearchField {
  return { value, onChange, placeholder: opts?.placeholder };
}

export function createFilterField(
  id: string,
  component: ReactNode,
): FilterField {
  return { id, component };
}

export function createResetButton(
  onClick: () => void,
  opts?: { label?: string },
): ActionButton {
  return {
    label: opts?.label ?? "Réinitialiser",
    icon: <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />,
    onClick,
    variant: "ghost",
  };
}

export function createBulkActions(
  selectedCount: number,
  actions: BulkAction[],
  opts?: { countLabel?: string; onClose?: () => void },
): BulkActionsConfig {
  return {
    selectedCount,
    countLabel: opts?.countLabel,
    onClose: opts?.onClose ?? (() => {}),
    actions,
  };
}
