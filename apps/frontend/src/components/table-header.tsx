"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshIcon, SearchIcon, XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState, type ReactNode } from "react";

// ── Types ───────────────────────────────────────────────────────────────────────

export interface SearchField {
  /** Valeur commitée (depuis l'URL). L'input se resynchronise dessus. */
  value: string;
  /** Appelé uniquement sur Enter ou clic du bouton loupe. */
  onSearch: (v: string) => void;
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
  extra?: ReactNode;
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

// ── SearchInput ─────────────────────────────────────────────────────────────────

/**
 * Input avec bouton loupe. State local pour la frappe ; onSearch n'est
 * appelé que sur Enter ou clic du bouton. Se resynchronise avec `value`
 * lors de la navigation retour/avant.
 */
function SearchInput({ search }: { search: SearchField }) {
  const [localValue, setLocalValue] = useState(search.value);

  // Resync quand l'URL change (navigation retour/avant)
  useEffect(() => {
    setLocalValue(search.value);
  }, [search.value]);

  const handleSubmit = () => search.onSearch(localValue);

  return (
    <div className="flex flex-1 min-w-50 max-w-xs">
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        placeholder={search.placeholder ?? "Rechercher..."}
        className="rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button
        variant="outline"
        size="icon"
        type="button"
        onClick={handleSubmit}
        className="rounded-l-none border-l-0 shrink-0"
      >
        <HugeiconsIcon icon={SearchIcon} className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TableHeader({
  search,
  filters,
  actions,
  bulkActions,
  extra,
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
      {search && <SearchInput search={search} />}
      {filters?.map((f) => (
        <div key={f.id}>{f.component}</div>
      ))}
      {actions?.map((a, i) => (
        <Button key={i} variant={a.variant ?? "outline"} onClick={a.onClick}>
          {a.icon}
          {a.label}
        </Button>
      ))}
      {extra && <div className="ml-auto">{extra}</div>}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function createSearchField(
  value: string,
  onSearch: (v: string) => void,
  opts?: { placeholder?: string },
): SearchField {
  return { value, onSearch, placeholder: opts?.placeholder };
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
