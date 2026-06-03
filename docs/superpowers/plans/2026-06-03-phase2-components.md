# Phase 2 — Composants UI Partagés

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer/enrichir les 13 composants UI partagés à la racine de `components/`, supprimer le dossier `components/shared/`, et consolider les doublons.

**Architecture:** Tous les composants partagés vivent directement dans `src/components/`. Pas de sous-dossier `shared/`. Imports via `@/components/<component>`. Les stubs existants sont remplacés par les implémentations complètes portées depuis `sfe_pi`.

**Tech Stack:** React 19, Shadcn/ui, TanStack Table v8, HugeIcons (via `@/lib/icons`), `class-variance-authority`, `use-debounce`

**Prérequis :** Phase 1 terminée (HugeIcons installé, `@/lib/icons.ts` enrichi)

---

## Task 1 — Supprimer components/shared/ et consolider les doublons

**Files:**

- Delete: `apps/frontend/src/components/shared/` (dossier entier)
- Delete: `apps/frontend/src/components/page-header.tsx` (simple — remplacé)
- Delete: `apps/frontend/src/components/confirm-dialog.tsx` (simple — remplacé)

- [ ] **Identifier les imports existants de ces fichiers**

```bash
cd apps/frontend && rg "from \"@/components/shared/" src -g "*.tsx" -g "*.ts" -l
rg "from \"@/components/page-header\"" src -g "*.tsx" -g "*.ts" -l
rg "from \"@/components/confirm-dialog\"" src -g "*.tsx" -g "*.ts" -l
```

- [ ] **Mettre à jour les imports cassés**

Pour chaque fichier trouvé, remplacer :

```ts
// AVANT
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CellActions } from "@/components/shared/cell-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import PageHeader from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";

// APRÈS
import PageHeader from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import CellActions from "@/components/cell-actions";
import { StatusBadge } from "@/components/status-badge";
import { DataTable } from "@/components/data-table/data-table";
```

- [ ] **Supprimer le dossier shared/ et les fichiers doublons**

```bash
rm -rf apps/frontend/src/components/shared/
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add -A apps/frontend/src/
git commit -m "chore(frontend): remove components/shared/ folder and consolidate duplicates"
```

---

## Task 2 — Enrichir DataTable (data-table/data-table.tsx)

**Files:**

- Modify: `apps/frontend/src/components/data-table/data-table.tsx`

- [ ] **Ajouter les props manquantes**

Ouvrir `apps/frontend/src/components/data-table/data-table.tsx` et enrichir l'interface + l'implémentation :

```tsx
"use client";

import {
  type ColumnDef,
  type Table,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination } from "./pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  pagination?: boolean; // true = DataTablePagination inline
  selectable?: boolean; // true = colonne checkbox
  onSelectionChange?: (rows: TData[]) => void;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string; // défaut: "Aucune donnée trouvée."
  toolbar?: (table: Table<TData>) => React.ReactNode;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  pagination = true,
  selectable = false,
  onSelectionChange,
  onRowClick,
  emptyMessage = "Aucune donnée trouvée.",
  toolbar,
  className,
}: DataTableProps<TData>) {
  // Colonne checkbox injectée si selectable
  const allColumns: ColumnDef<TData>[] = selectable
    ? [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label="Tout sélectionner"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label="Sélectionner la ligne"
            />
          ),
          enableSorting: false,
          enableHiding: false,
          size: 40,
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    onRowSelectionChange: (updater) => {
      if (!onSelectionChange) return;
      // Résoudre après update
      const newSelection =
        typeof updater === "function" ? updater({}) : updater;
      const selected = data.filter((_, i) => newSelection[i]);
      onSelectionChange(selected);
    },
  });

  return (
    <div className={cn("space-y-4", className)}>
      {toolbar && <div>{toolbar(table)}</div>}
      <div className="rounded-md border">
        <TableUI>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} style={{ width: h.getSize() }}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {allColumns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableUI>
      </div>
      {pagination && <DataTablePagination table={table} />}
    </div>
  );
}
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "data-table"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/data-table/data-table.tsx
git commit -m "feat(frontend): enrich DataTable with selectable, pagination toggle, emptyMessage"
```

---

## Task 3 — Créer ButtonTooltip

**Files:**

- Create: `apps/frontend/src/components/button-tooltip.tsx`

- [ ] **Créer le fichier**

```tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ButtonTooltipProps = React.ComponentProps<typeof Button> & {
  tooltipContent: string;
  tooltipClassName?: string;
};

export const ButtonTooltip = ({
  tooltipClassName,
  tooltipContent,
  ...props
}: ButtonTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props} />
      </TooltipTrigger>
      <TooltipContent className={tooltipClassName}>
        <p>{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
};
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "button-tooltip"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/button-tooltip.tsx
git commit -m "feat(frontend): add ButtonTooltip component"
```

---

## Task 4 — Créer CellActions (implémentation complète)

**Files:**

- Create: `apps/frontend/src/components/cell-actions.tsx`

- [ ] **Créer le fichier**

```tsx
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
  DeleteIcon,
  EditIcon,
  EyeIcon,
  FileSearchIcon,
  FolderOpenIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  SendIcon,
  TrashIcon,
} from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
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
                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
              </ButtonTooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dropdownActions.map((action, i) => (
                <DropdownMenuItem
                  key={action.id ?? i}
                  disabled={action.disabled ?? action.loading}
                  onClick={() => handleActionClick(action)}
                  asChild={!!action.href}
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
    icon: <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={EditIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={TrashIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={CopyIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={FolderOpenIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={ExternalLinkIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={CancelSquareIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={SendIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={FileSearchIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={CheckCircleIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={CopyIcon} className="h-4 w-4" />,
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
    icon: <HugeiconsIcon icon={CheckCircleIcon} className="h-4 w-4" />,
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
              icon: <HugeiconsIcon icon={EditIcon} className="h-4 w-4" />,
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
```

> ⚠️ Ajouter dans `@/lib/icons.ts` si absents : `CancelSquareIcon`, `FileSearchIcon`, `FolderOpenIcon`

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "cell-actions"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/cell-actions.tsx
git commit -m "feat(frontend): add CellActions with 13 helpers and StandardCellActions"
```

---

## Task 5 — Créer PageHeader (implémentation complète)

**Files:**

- Create: `apps/frontend/src/components/page-header.tsx` (remplace l'ancienne version simple)

- [ ] **Créer le fichier**

```tsx
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
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

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
            size="sm"
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
        size="sm"
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
      size="sm"
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
      {showBack && (
        <div>
          {backHref ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              asChild
            >
              <Link href={backHref}>
                <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4" />
                {typeof backNavigation === "object" && backNavigation.label
                  ? backNavigation.label
                  : "Retour"}
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={handleBack}
            >
              <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4" />
              {typeof backNavigation === "object" && backNavigation.label
                ? backNavigation.label
                : "Retour"}
            </Button>
          )}
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {status && <div>{status}</div>}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
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
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "page-header"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/page-header.tsx
git commit -m "feat(frontend): add full-featured PageHeader with variants and helpers"
```

---

## Task 6 — Créer ConfirmDialog + useConfirmDialog

**Files:**

- Create: `apps/frontend/src/components/confirm-dialog.tsx`
- Create: `apps/frontend/src/components/hooks/use-confirm-dialog.tsx`

- [ ] **Créer `confirm-dialog.tsx`**

```tsx
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
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import type { IconSvgElement } from "@hugeicons/react";

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
        <AlertDialogHeader>
          <div
            className={cn(
              "mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full",
              cfg.bg,
            )}
          >
            <HugeiconsIcon
              icon={cfg.icon}
              className={cn("h-6 w-6", cfg.color)}
            />
          </div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
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
```

- [ ] **Créer `hooks/use-confirm-dialog.tsx`**

```tsx
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
```

- [ ] **Créer le dossier hooks si absent**

```bash
mkdir -p apps/frontend/src/components/hooks
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep -E "confirm-dialog|use-confirm"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/confirm-dialog.tsx apps/frontend/src/components/hooks/use-confirm-dialog.tsx
git commit -m "feat(frontend): add ConfirmDialog and useConfirmDialog hook with presets"
```

---

## Task 7 — Créer StatusBadge

**Files:**

- Create: `apps/frontend/src/components/status-badge.tsx`

- [ ] **Créer le fichier**

```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "secondary";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
  icon?: IconSvgElement;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<string, { variant: StatusVariant; label: string }> =
  {
    ACTIVE: { variant: "success", label: "Actif" },
    INACTIVE: { variant: "secondary", label: "Inactif" },
    DRAFT: { variant: "secondary", label: "Brouillon" },
    PENDING: { variant: "warning", label: "En attente" },
    VALIDATED: { variant: "success", label: "Validé" },
    CANCELLED: { variant: "destructive", label: "Annulé" },
    PAID: { variant: "success", label: "Payé" },
    PARTIALLY_PAID: { variant: "warning", label: "Partiellement payé" },
    SENT: { variant: "info", label: "Envoyé" },
    ACCEPTED: { variant: "success", label: "Accepté" },
    REFUSED: { variant: "destructive", label: "Refusé" },
    EXPIRED: { variant: "destructive", label: "Expiré" },
    IN_PREPARATION: { variant: "warning", label: "En préparation" },
    PARTIALLY_DELIVERED: { variant: "warning", label: "Partiellement livré" },
    DELIVERED: { variant: "success", label: "Livré" },
    INVOICED: { variant: "info", label: "Facturé" },
    IN_PROGRESS: { variant: "info", label: "En cours" },
    PARTIAL: { variant: "warning", label: "Partiel" },
    PARTIALLY_RECEIVED: { variant: "warning", label: "Partiellement reçu" },
    RECEIVED: { variant: "success", label: "Reçu" },
    COMPLETED: { variant: "success", label: "Terminé" },
    ENABLED: { variant: "success", label: "Activé" },
    DISABLED: { variant: "secondary", label: "Désactivé" },
  };

const VARIANT_COLORS: Record<StatusVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
  warning:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  destructive: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  secondary: "bg-muted text-muted-foreground",
};

const DOT_COLORS: Record<StatusVariant, string> = {
  default: "bg-muted-foreground",
  success: "bg-emerald-500",
  warning: "bg-orange-500",
  destructive: "bg-red-500",
  info: "bg-blue-500",
  secondary: "bg-muted-foreground",
};

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusBadge({
  status,
  variant,
  className,
  icon,
  showDot,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const resolvedVariant: StatusVariant =
    variant ?? config?.variant ?? "default";
  const label = config?.label ?? formatStatusLabel(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_COLORS[resolvedVariant],
        className,
      )}
    >
      {showDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            DOT_COLORS[resolvedVariant],
          )}
        />
      )}
      {icon && <HugeiconsIcon icon={icon} className="h-3 w-3" />}
      {label}
    </span>
  );
}
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "status-badge"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/status-badge.tsx
git commit -m "feat(frontend): add StatusBadge with 23 status mappings and 6 variants"
```

---

## Task 8 — Créer use-bulk-selection hook

**Files:**

- Create: `apps/frontend/src/components/hooks/use-bulk-selection.tsx`

- [ ] **Créer le fichier**

```tsx
"use client";

import { toast } from "sonner";

interface BulkResult {
  success: number;
  failed: number;
  errors: Error[];
}

export async function executeBulkAction<T>(
  items: T[],
  action: (item: T) => Promise<void>,
): Promise<BulkResult> {
  const result: BulkResult = { success: 0, failed: 0, errors: [] };
  await Promise.allSettled(
    items.map(async (item) => {
      try {
        await action(item);
        result.success++;
      } catch (e) {
        result.failed++;
        result.errors.push(e as Error);
      }
    }),
  );
  return result;
}

export function showBulkResultToast(
  result: BulkResult,
  successLabel = "Opération réussie",
  errorLabel = "Erreur",
) {
  if (result.success > 0 && result.failed === 0) {
    toast.success(`${successLabel} (${result.success})`);
  } else if (result.success > 0 && result.failed > 0) {
    toast.warning(`${result.success} réussie(s), ${result.failed} échouée(s)`);
  } else {
    toast.error(`${errorLabel} — ${result.failed} échouée(s)`);
  }
}
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/hooks/use-bulk-selection.tsx
git commit -m "feat(frontend): add executeBulkAction and showBulkResultToast helpers"
```

---

## Task 9 — Créer TableHeader

**Files:**

- Create: `apps/frontend/src/components/table-header.tsx`

- [ ] **Créer le fichier**

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, XIcon, RefreshIcon, DeleteIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { type ReactNode, type KeyboardEvent } from "react";

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
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "table-header"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/table-header.tsx
git commit -m "feat(frontend): add TableHeader with search, filters, bulk actions"
```

---

## Task 10 — Créer DetailSection, DetailTabs, Pagination, SingleSelect

**Files:**

- Create: `apps/frontend/src/components/detail-section.tsx`
- Create: `apps/frontend/src/components/detail-tabs.tsx`
- Create: `apps/frontend/src/components/pagination.tsx`
- Create: `apps/frontend/src/components/single-select.tsx`

- [ ] **Créer `detail-section.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface DetailItemProps {
  label: string;
  value?: ReactNode;
  className?: string;
}
export function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">
        {value ?? <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}
export function DetailSection({
  title,
  description,
  action,
  children,
  className,
}: DetailSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

interface DetailGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}
export function DetailGrid({
  columns = 2,
  children,
  className,
}: DetailGridProps) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[columns];
  return (
    <div className={cn("grid gap-4", colClass, className)}>{children}</div>
  );
}

interface DetailCardProps {
  title: string;
  items: { label: string; value?: ReactNode }[];
  columns?: 1 | 2;
  className?: string;
}
export function DetailCard({
  title,
  items,
  columns = 2,
  className,
}: DetailCardProps) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-3", className)}>
      <h4 className="text-sm font-semibold">{title}</h4>
      <DetailGrid columns={columns}>
        {items.map((item, i) => (
          <DetailItem key={i} label={item.label} value={item.value} />
        ))}
      </DetailGrid>
    </div>
  );
}

interface DetailSummaryItem {
  label: string;
  value: ReactNode;
  variant?: "default" | "success" | "destructive";
}
interface DetailSummaryProps {
  title?: string;
  items: DetailSummaryItem[];
  className?: string;
}
export function DetailSummary({ title, items, className }: DetailSummaryProps) {
  return (
    <div className={cn("rounded-lg bg-muted/50 p-4 space-y-2", className)}>
      {title && <h4 className="text-sm font-semibold">{title}</h4>}
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground min-w-32">{item.label}</span>
          <span
            className={cn(
              "font-medium",
              item.variant === "success" && "text-emerald-600",
              item.variant === "destructive" && "text-destructive",
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Créer `detail-tabs.tsx`**

```tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface TabItem {
  value: string;
  label: string;
  icon?: IconSvgElement;
  content: ReactNode;
  disabled?: boolean;
}

interface DetailTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export function DetailTabs({
  tabs,
  defaultValue,
  className,
  onChange,
}: DetailTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue ?? tabs[0]?.value}
      onValueChange={onChange}
      className={className}
    >
      <TabsList
        className={cn("grid w-full", `grid-cols-${Math.min(tabs.length, 4)}`)}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
          >
            {tab.icon && (
              <HugeiconsIcon icon={tab.icon} className="mr-1 h-4 w-4" />
            )}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// ── Tab factories ──────────────────────────────────────────────────────────────
export const createOverviewTab = (content: ReactNode): TabItem => ({
  value: "overview",
  label: "Vue d'ensemble",
  content,
});
export const createDetailsTab = (content: ReactNode): TabItem => ({
  value: "details",
  label: "Détails",
  content,
});
export const createHistoryTab = (content: ReactNode): TabItem => ({
  value: "history",
  label: "Historique",
  content,
});
export const createDocumentsTab = (content: ReactNode): TabItem => ({
  value: "documents",
  label: "Documents",
  content,
});
export const createPaymentsTab = (content: ReactNode): TabItem => ({
  value: "payments",
  label: "Paiements",
  content,
});
export const createOrdersTab = (content: ReactNode): TabItem => ({
  value: "orders",
  label: "Commandes",
  content,
});
export const createInvoicesTab = (content: ReactNode): TabItem => ({
  value: "invoices",
  label: "Factures",
  content,
});
export const createActivityTab = (content: ReactNode): TabItem => ({
  value: "activity",
  label: "Activité",
  content,
});
```

- [ ] **Créer `pagination.tsx`**

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: PaginationProps) {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 text-sm",
        className,
      )}
    >
      <p className="text-muted-foreground">
        Affichage de <span className="font-medium">{from}</span> à{" "}
        <span className="font-medium">{to}</span> sur{" "}
        <span className="font-medium">{totalCount}</span>
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground whitespace-nowrap">
            Lignes par page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <HugeiconsIcon icon={ChevronLeftIcon} className="h-4 w-4" />
          </Button>
          <span className="min-w-[4rem] text-center text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <HugeiconsIcon icon={ChevronRightIcon} className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Créer `single-select.tsx`**

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { useDebounce } from "use-debounce";

export interface SingleSelectOption {
  value: string;
  label: string;
}

interface SingleSelectProps {
  options: SingleSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  onSearchChange?: (search: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  addNewLabel?: string;
  onClickAddNew?: () => void;
  disabled?: boolean;
  btnClassName?: string;
  leftIcon?: ReactNode;
  className?: string;
}

export default function SingleSelect({
  options,
  value,
  onValueChange,
  onSearchChange,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat.",
  addNewLabel,
  onClickAddNew,
  disabled,
  btnClassName,
  leftIcon,
  className,
}: SingleSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const handleSearch = (v: string) => {
    setSearch(v);
    onSearchChange?.(v);
  };

  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("justify-between font-normal", btnClassName, className)}
        >
          <span className="flex items-center gap-2 truncate">
            {leftIcon}
            <span className={cn(!selected && "text-muted-foreground")}>
              {selected?.label ?? placeholder}
            </span>
          </span>
          <HugeiconsIcon
            icon={ChevronDownIcon}
            className="ml-2 h-4 w-4 shrink-0 text-muted-foreground"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={(v) => {
                    onValueChange?.(v);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <HugeiconsIcon
                    icon={CheckIcon}
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {addNewLabel && onClickAddNew && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onClickAddNew();
                      setOpen(false);
                    }}
                  >
                    <HugeiconsIcon icon={PlusIcon} className="mr-2 h-4 w-4" />
                    {addNewLabel}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Vérifier la compilation globale**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1
```

Expected : 0 erreurs.

- [ ] **Vérifier qu'aucun import shared/ ne reste**

```bash
cd apps/frontend && rg "from \"@/components/shared/" src -g "*.tsx" -g "*.ts" -l
```

Expected : aucun fichier.

- [ ] **Commit final phase 2**

```bash
git add apps/frontend/src/components/
git commit -m "feat(frontend): add DetailSection, DetailTabs, Pagination, SingleSelect — phase 2 complete"
```
