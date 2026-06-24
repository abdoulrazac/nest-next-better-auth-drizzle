# Spec — Recyclage UI Frontend (depuis sfe_pi)

**Date :** 2026-06-03  
**Scope :** Frontend uniquement — `apps/frontend/`  
**Source :** `/Users/abdoul/Desktop/Dev/Hamed-Banao/facturations-projet/sfe-management/sfe_pi`

---

## Objectif

Porter et adapter les patterns UI du projet `sfe_pi` (tRPC + Prisma + HugeIcons) vers ce projet (REST `@repo/api-client` + Drizzle + NestJS + Better Auth). Résultat attendu : 4 axes livrables — icônes, composants partagés, layout, skills agents.

---

## Contraintes

- **Icônes :** HugeIcons uniquement (`@hugeicons/core-free-icons` + `@hugeicons/react`). Pas de `lucide-react` ni `@tabler/icons-react` dans le code applicatif. Toujours passer par `@/lib/icons.ts`.
- **Attention aux faux-amis** entre lucide-react et hugeicons : des noms proches (`AlertCircle`, `Save`, `Edit`, etc.) peuvent référencer des icônes visuellement différentes. Vérifier chaque mapping manuellement.
- **API :** hooks `@repo/api-client` + `@tanstack/react-query`. Pas de tRPC.
- **Types :** `@repo/validators/<domain>`. Pas de `src/types/enums.ts` local.
- **Auth :** Better Auth RBAC. Pas de `permission.ts` tRPC.
- **DataTable — une seule implémentation :** `components/data-table/data-table.tsx` est enrichi avec les props des skills (`selectable`, `pagination`, `onSelectionChange`, `emptyMessage`). Le stub `components/shared/data-table.tsx` est supprimé. Les skills importent depuis `@/components/data-table/data-table`.
- **Structure `components/` :** tous les composants partagés vivent à la racine de `components/`. Le dossier `components/shared/` est **supprimé**. Import pattern : `@/components/<component>`.

---

## Axe 1 — Installation & migration icônes globale

### 1.1 Installation

Ajouter dans `apps/frontend/package.json` :

```json
"@hugeicons/core-free-icons": "latest",
"@hugeicons/react": "latest"
```

### 1.2 Règle d'import

```ts
// CORRECT — toujours
import { EditIcon, TrashIcon } from "@/lib/icons";
import { Icon } from "@/components/ui/icon";

// INTERDIT — jamais en dehors de lib/icons.ts
import { Edit } from "@hugeicons/core-free-icons";
import { Edit } from "lucide-react";
import { IconEdit } from "@tabler/icons-react";
```

### 1.3 Fichiers à migrer

**31 fichiers `lucide-react` :**

- `src/app/(dashboard)/settings/(settings)/subscription/_components/` (6 fichiers)
- `src/components/auth/organization/` (15 fichiers)
- `src/components/auth/` (3 fichiers : `additional-field.tsx`, `reset-password.tsx`, `sign-up.tsx`)
- `src/components/auth/user/user-avatar.tsx`
- `src/components/header.tsx`
- `src/components/sidebar.tsx`
- `src/lib/auth/organization-plugin.tsx`

**20 fichiers `@tabler/icons-react` (ui primitives) :**

- `src/components/ui/` : `accordion`, `breadcrumb`, `calendar`, `carousel`, `checkbox`, `combobox`, `command`, `context-menu`, `dialog`, `dropdown-menu`, `input-otp`, `menubar`, `native-select`, `navigation-menu`, `pagination`, `select`, `sheet`, `sidebar`, `sonner`, `spinner`

### 1.4 Mappings principaux (lucide → hugeicons via @/lib/icons)

| lucide-react      | @/lib/icons export         | HugeIcons original    |
| ----------------- | -------------------------- | --------------------- |
| `Eye`             | `EyeIcon`                  | `Eye`                 |
| `EyeOff`          | `EyeOffIcon`               | `EyeOff` (à vérifier) |
| `AlertCircle`     | `AlertCircleIcon`          | `AlertCircle`         |
| `Loader2`         | `LoadingIcon` (à ajouter)  | `Loading03Icon`       |
| `CheckCircle`     | `CheckCircleIcon`          | `CheckCircle`         |
| `Plus`            | `PlusIcon`                 | `PlusSignIcon`        |
| `Trash2`          | `TrashIcon`                | `Delete02Icon`        |
| `Edit` / `Pencil` | `EditIcon`                 | `Edit02Icon`          |
| `X`               | `XIcon`                    | `Cancel01Icon`        |
| `ChevronDown`     | `ChevronDownIcon`          | `ArrowDown01Icon`     |
| `Copy`            | `CopyIcon`                 | `Copy01Icon`          |
| `Check`           | `CheckIcon`                | `Tick01Icon`          |
| `Building2`       | `BuildingIcon` (à ajouter) | `Building03Icon`      |
| `Mail`            | `MailIcon`                 | `Mail01Icon`          |
| `Globe`           | `GlobeIcon`                | `Globe02Icon`         |
| `Link`            | `LinkIcon`                 | `Link01Icon`          |
| `LogOut`          | `LogoutIcon`               | `Logout02Icon`        |
| `User`            | `UserIcon`                 | `User01Icon`          |

> Chaque mapping doit être vérifié visuellement. En cas de doute, chercher dans `@hugeicons/core-free-icons` un nom plus précis.

---

## Axe 2 — Composants UI partagés

Tous dans `apps/frontend/src/components/` (racine). Le dossier `components/shared/` est **supprimé** — tous ses fichiers sont déplacés/recréés à la racine de `components/`. Imports : `@/components/<component>`.

### 2.1 `components/page-header.tsx` — Source unique (enrichie)

**Interface finale :**

```ts
type PageHeaderVariant = "default" | "list" | "detail" | "detail-card" | "create" | "edit";

interface HeaderAction {
  label: string;
  icon?: IconSvgElement;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  disabled?: boolean;
  loading?: boolean;
  children?: HeaderAction[]; // dropdown
}

interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: PageHeaderVariant;
  backNavigation?: boolean | { label?: string; href?: string; onClick?: () => void };
  primaryAction?: HeaderAction;
  secondaryActions?: HeaderAction[];
  status?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

// Helpers exportés
export const PageHeaderActions = {
  create(href, label): HeaderAction,
  edit(href): HeaderAction,
  save(onClick, loading?): HeaderAction,
  delete(onClick): HeaderAction,
  export(onClick): HeaderAction,
  cancel(href): HeaderAction,
};
```

### 2.2 `components/data-table/data-table.tsx` — Enrichir (source unique)

Supprimer le stub `components/shared/data-table.tsx`. Enrichir l'implémentation existante avec les props manquantes pour les skills :

```ts
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  pagination?: boolean; // false = pas de DataTablePagination inline
  selectable?: boolean; // active la colonne checkbox
  onSelectionChange?: (rows: TData[]) => void;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string; // message vide en français
  toolbar?: (table: Table<TData>) => ReactNode; // conservé
}
```

Import dans les skills : `import { DataTable } from "@/components/data-table/data-table"`

### 2.3 `components/button-tooltip.tsx` — Créer (dépendance de CellActions)

Port depuis l'ancien projet. `TooltipContent` du nouveau projet n'a pas de prop `variant` — adapter en supprimant `tooltipVariant` ou en gérant la couleur via `className`.

```ts
type ButtonTooltipProps = React.ComponentProps<typeof Button> & {
  tooltipContent: string;
  tooltipClassName?: string;
};
```

### 2.4 `components/cell-actions.tsx` — Source unique (implémentation complète)

Interface complète depuis l'ancien projet avec toutes ses fonctionnalités :

```ts
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
  visibleActions?: number; // N premiers = ButtonTooltip inline, reste = DropdownMenu
}
```

**Comportement :**

- Les `visibleActions` premiers s'affichent en `ButtonTooltip` inline (avec tooltip au hover)
- Le reste déborde dans un `DropdownMenu` "Plus d'actions" (`MoreHorizontalCircle01Icon`)
- `confirmDialog` sur une action auto-spawne un `ConfirmDialog` inline
- `href` → `Link` via `ButtonTooltip asChild`
- Utilise `ButtonGroup` (`ui/button-group`) pour le layout

**13 factory functions :**

```ts
export function createViewAction(hrefOrFn, tooltip?); // Eye icon, ghost
export function createEditAction(onClick, tooltip?); // Edit icon, ghost
export function createDeleteAction(onClick, opts?); // Delete02 icon, destructive + confirmDialog auto
export function createCopyAction(onClick, tooltip?); // Copy icon, ghost
export function createOpenAction(onClick, tooltip?); // FolderOpen icon, ghost
export function createNavigateAction(href, tooltip?); // SquareArrowUpRight icon, ghost
export function createCancelAction(onClick, tooltip?); // CancelSquare icon, destructive + confirmDialog auto
export function createSendEmailAction(onClick, tooltip?); // Send icon, outline + confirmDialog auto
export function createPreviewAction(onClick, tooltip?); // FileSearch icon, ghost
export function createValidateAction(onClick, tooltip?); // CheckCircle icon, outline
export function createDuplicateAction(onClick, tooltip?); // Copy icon, ghost
export function createToggleStatusAction(onClick, isActive, tooltip?);
export function createAction(icon, onClick?, options?); // Custom
```

**`StandardCellActions` composant clé-en-main :**

```ts
interface StandardCellActionsProps {
  onView?: () => void;
  viewHref?: string;
  onEdit?: () => void;
  editHref?: string;
  onDelete?: () => void;
  deleteLabel?: string; // pour la description du dialog
  extraActions?: ExtraAction[];
  align?: CellActionsProps["align"];
  visibleActions?: number;
}

// ExtraAction
interface ExtraAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: CellAction["variant"];
  disabled?: boolean;
  confirm?: boolean;
}
```

**Icônes à ajouter dans `@/lib/icons.ts` si absentes :**
`MoreHorizontalCircle01Icon`, `CancelSquareIcon`, `FileSearchIcon`, `SquareArrowUpRightIcon`, `FolderOpenIcon`, `SendIcon`

### 2.5 `components/status-badge.tsx` — Source unique (enrichie)

- 22 statuts mappés, labels en français
- 6 variants : `default | success | warning | destructive | info | secondary`
- Props : `status`, `variant?`, `className?`, `showDot?`, `icon?`
- Fallback : formatte la string si statut inconnu

### 2.6 `components/confirm-dialog.tsx` — Source unique (enrichie)

**`confirm-dialog.tsx` :**

```ts
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "warning" | "info";
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
}
```

**`hooks/use-confirm-dialog.tsx` :**

```ts
// Hook retournant une promise-based confirm()
const { confirm, ConfirmDialogComponent } = useConfirmDialog();
const ok = await confirm({ title, description, variant });

// Presets
confirmDialogPresets.delete(name);
confirmDialogPresets.cancel();
confirmDialogPresets.archive();
confirmDialogPresets.restore();
```

### 2.7 `components/table-header.tsx` — Créer

```ts
interface TableHeaderProps {
  search?: SearchField;
  filters?: FilterField[];
  actions?: ActionButton[];
  bulkActions?: BulkActionsConfig;
  spacing?: "sm" | "md" | "lg";
}

// Helpers
export const createSearchField(value, onChange, opts?)
export const createFilterField(id, component, opts?)
export const createResetButton(onClick, opts?)
export const createBulkActions(selectedCount, actions, opts?)
```

### 2.8 `components/detail-section.tsx` — Créer

```ts
export function DetailItem({ label, value, className })
export function DetailSection({ title, description?, action?, children, className })
export function DetailGrid({ columns?: 1|2|3|4, children, className })
export function DetailCard({ title, items, columns?, className })
export function DetailSummary({ title, items, className })
```

### 2.9 `components/detail-tabs.tsx` — Créer

```ts
interface TabItem {
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
}

// Tab factory helpers (labels en français)
export const createOverviewTab(content)
export const createDetailsTab(content)
export const createHistoryTab(content)
export const createDocumentsTab(content)
```

### 2.10 `components/pagination.tsx` — Créer

Pagination **externe** (non liée à react-table) :

```ts
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}
```

Labels en français : "Affichage de X à Y sur Z", "Lignes par page".

### 2.11 `components/single-select.tsx` — Créer

```ts
interface SingleSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  onSearchChange?: (search: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  addNewLabel?: string;
  onClickAddNew?: () => void;
  disabled?: boolean;
  btnClassName?: string;
  leftIcon?: ReactNode;
}
```

Pattern `Command` + `Popover`. Debounce 300ms sur `onSearchChange`.

---

## Axe 3 — Layout

### 3.1 `components/layout/app-sidebar.tsx` — Remplacer

- `collapsible="icon"` variant
- Header : `Logo` (icon-only quand collapsed, full brand quand expanded)
- Content : `NavMain` avec `sidebarData.navGroups`

### 3.2 `components/layout/nav-main.tsx` — Créer

- Groupes collapsibles avec état persisté dans `localStorage`
- Items standalone et items avec sous-items
- Icônes via `Icon`
- État actif via `usePathname()`
- Support `addUrl` (bouton `+` au hover pour créer)

### 3.3 `components/layout/command-menu.tsx` — Créer

- Ouverture `⌘K` / `Ctrl+K`
- Recherche dans tous les items de `sidebarData`
- Navigation directe sur sélection

### 3.4 `components/layout/sidebar-data.ts` — Adapter

navGroups adaptés aux routes du projet :

```
Général       → Dashboard (/)
Comptes       → Users & Roles (collapsible) : /account/users, /account/roles, /account/audit-logs
Système       → Notifications (/notifications), Files (/files), Webhooks (/webhooks)
Paramètres    → Settings (collapsible) : /settings, /settings/templates, /settings/units
               + Taxes (collapsible) : /settings/tax-rates, /settings/psvb-rates
```

### 3.5 `components/layout/base-page.tsx` — Enrichir

Header complet (h-16) :

- Gauche : `SidebarTrigger` + `Separator` + `Breadcrumb`
- Droite : `CommandMenu` + `ThemeSwitcher` + `NavUser`
- `breadcrumbs` reste optionnel
- Content area : `p-4 pt-0 mx-auto max-w-6xl 2xl:max-w-7xl mt-6`

---

## Axe 4 — 7 Skills agents

Créés dans `.agents/skills/` après que les composants de l'Axe 2 existent.

### Adaptations communes à tous les skills

| sfe_pi                              | Ce projet                                              |
| ----------------------------------- | ------------------------------------------------------ |
| `api.module.entity.*` (tRPC)        | Hooks de `@repo/api-client` + `useQuery`/`useMutation` |
| `@hugeicons/core-free-icons` direct | Toujours via `@/lib/icons`                             |
| Types locaux `src/types/enums.ts`   | `@repo/validators/<domain>`                            |
| Prisma model                        | Drizzle schema dans `packages/db/`                     |
| tRPC router                         | NestJS controller + `@repo/validators`                 |
| `permission.ts` tRPC                | Better Auth RBAC                                       |
| Labels UI en français               | Labels UI en français (conservé)                       |

### 4.1 `shared-components` — Nouveau

Catalogue de référence de tous les composants de l'Axe 2 avec :

- Props complètes
- Exemples de code
- Quand utiliser chaque composant

### 4.2 `list-page` — Remplace `nextjs-list-page`

Pattern "centralised hook" :

- `features/<entity>/hooks.ts` : mutations + handlers + configs + `ConfirmDialogComponent`
- `features/<entity>/columns.tsx` : factory `buildColumns(callbacks)`
- `features/<entity>/index.tsx` : page fine consommatrice du hook
- `TableHeader` + `DataTable` + `Pagination` séparée
- `DetailSheet` reçoit `handlers` via props (pas de mutations dupliquées)

### 4.3 `entity-select` — Nouveau

- Select avec recherche debounced (300ms) via `@repo/api-client`
- Déduplication : search + default + selected
- Dialog inline de création
- Variant full-object callback (`onEntitySelect`)
- Variant sans dialog

### 4.4 `embedded-table` — Nouveau

- Template complet `hooks.ts` (centralisé)
- `build{Entity}Actions()` descriptor pattern
- Thin consumer `embedded-{entity}-table.tsx`
- Matrice shared-vs-differs entre list page / embedded table / detail sheet

### 4.5 `detail-sheet` — Remplace `nextjs-detail-sheet`

- `Sheet` shadcn/ui
- Reçoit `handlers` via props depuis le hook centralisé
- Pas de mutations propres, pas de ConfirmDialog propre
- Tabs via `DetailTabs`
- Query gating : `enabled: open && !!id`

### 4.6 `detail-page` — Remplace `nextjs-detail-page`

- 3 états : loading / error / not-found
- `PageHeader variant="detail-card"`
- KPI cards
- Tabs URL state
- Embedded tables dans les tabs

### 4.7 `entity` — Nouveau

Scaffold complet end-to-end :

1. Schema Drizzle dans `packages/db/`
2. Export dans `packages/db/index.ts`
3. Migration (`bun run db:generate && db:migrate`)
4. Validators dans `packages/validators/<domain>/`
5. NestJS module (skill `nest-module`)
6. Endpoints (skill `nest-endpoint`)
7. API client regénéré (`bun run generate:api`)
8. Hooks frontend (`@repo/api-client`)
9. Pages frontend (list, detail, form, select)
10. Navigation dans `sidebar-data.ts`

---

## Ordre d'exécution

```
Phase 1 — Fondations
  1.1  Installer @hugeicons dans package.json
  1.2  Migrer les icônes (51 fichiers)

Phase 2 — Composants partagés
  2.1  Supprimer components/shared/ (tout déplacer à la racine components/)
  2.2  data-table/data-table.tsx (enrichir : selectable, pagination, onSelectionChange, emptyMessage)
  2.3  components/button-tooltip.tsx (créer)
  2.4  components/cell-actions.tsx (source unique enrichie)
  2.5  components/page-header.tsx (source unique enrichie)
  2.6  components/confirm-dialog.tsx (source unique enrichie) + hooks/use-confirm-dialog.tsx
  2.7  components/status-badge.tsx (source unique enrichie)
  2.8  hooks/use-bulk-selection.tsx (créer)
  2.9  components/table-header.tsx (créer)
  2.10 components/detail-section.tsx (créer)
  2.11 components/detail-tabs.tsx (créer)
  2.12 components/pagination.tsx (créer)
  2.13 components/single-select.tsx (créer)

Phase 3 — Layout
  3.1  nav-main.tsx
  3.2  app-sidebar.tsx
  3.3  command-menu.tsx
  3.4  sidebar-data.ts
  3.5  base-page.tsx

Phase 4 — Skills
  4.1  shared-components/SKILL.md
  4.2  list-page → nextjs-list-page/SKILL.md
  4.3  entity-select/SKILL.md
  4.4  embedded-table/SKILL.md
  4.5  detail-sheet → nextjs-detail-sheet/SKILL.md
  4.6  detail-page → nextjs-detail-page/SKILL.md
  4.7  entity/SKILL.md
```

---

## Fichiers modifiés / créés (récapitulatif)

```
apps/frontend/
  package.json                                         # + @hugeicons
  src/lib/icons.ts                                     # Mappings enrichis
  src/components/
    data-table/
      data-table.tsx                                   # Enrichi (selectable, pagination, onSelectionChange)
    button-tooltip.tsx                                 # Créé (dépendance CellActions)
    page-header.tsx                                    # Source unique enrichie (depuis sfe_pi, remplace l'ancienne racine)
    cell-actions.tsx                                   # Source unique enrichie (depuis sfe_pi, 13 helpers + StandardCellActions)
    status-badge.tsx                                   # Source unique enrichie (22 statuts FR, 6 variants, dot/icon)
    confirm-dialog.tsx                                 # Source unique enrichie (depuis sfe_pi)
    table-header.tsx                                   # Créé
    detail-section.tsx                                 # Créé
    detail-tabs.tsx                                    # Créé
    pagination.tsx                                     # Créé (externe, non liée react-table)
    single-select.tsx                                  # Créé
    shared/                                            # DOSSIER SUPPRIMÉ (tous les fichiers déplacés à la racine)
    hooks/
      use-confirm-dialog.tsx                           # Créé
      use-bulk-selection.tsx                           # Créé (executeBulkAction, showBulkResultToast)
    layout/
      app-sidebar.tsx                                  # Remplacé
      nav-main.tsx                                     # Créé
      command-menu.tsx                                 # Créé
      sidebar-data.ts                                  # Adapté
      base-page.tsx                                    # Enrichi
    ui/ (20 fichiers)                                  # @tabler → HugeIcons
    auth/ + header.tsx + sidebar.tsx (31 fichiers)     # lucide → HugeIcons

.agents/skills/
  shared-components/SKILL.md                          # Créé
  nextjs-list-page/SKILL.md                           # Remplacé
  entity-select/SKILL.md                              # Créé
  embedded-table/SKILL.md                             # Créé
  nextjs-detail-sheet/SKILL.md                        # Remplacé
  nextjs-detail-page/SKILL.md                         # Remplacé
  entity/SKILL.md                                     # Créé
```
