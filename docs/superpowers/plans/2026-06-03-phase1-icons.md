# Phase 1 — Installation & Migration Icônes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Installer HugeIcons et remplacer tous les imports `lucide-react` (32 fichiers) et `@tabler/icons-react` (20 fichiers) par des imports `@/lib/icons`.

**Architecture:** Toutes les icônes passent par `src/lib/icons.ts` comme barrel d'export. On enrichit d'abord ce fichier avec les icônes manquantes, puis on migre fichier par fichier.

**Tech Stack:** `@hugeicons/core-free-icons`, `@hugeicons/react`, `bun`

---

## Règle absolue

```ts
// CORRECT
import { EditIcon, TrashIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
<HugeiconsIcon icon={EditIcon} className="h-4 w-4" />

// INTERDIT — jamais hors de lib/icons.ts
import { Edit } from "@hugeicons/core-free-icons";
import { Edit } from "lucide-react";
```

---

## Task 1 — Installer @hugeicons

**Files:**

- Modify: `apps/frontend/package.json`

- [ ] **Ajouter les dépendances**

Dans `apps/frontend/package.json`, ajouter dans `dependencies` :

```json
"@hugeicons/core-free-icons": "^1.0.0",
"@hugeicons/react": "^1.0.0"
```

- [ ] **Installer**

```bash
cd apps/frontend && bun install
```

Expected : pas d'erreur, `node_modules/@hugeicons/` présent.

- [ ] **Vérifier l'import**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | head -5
```

- [ ] **Commit**

```bash
git add apps/frontend/package.json bun.lock
git commit -m "chore(frontend): add @hugeicons dependencies"
```

---

## Task 2 — Enrichir @/lib/icons.ts avec les icônes manquantes

**Files:**

- Modify: `apps/frontend/src/lib/icons.ts`

Les icônes suivantes sont utilisées dans les fichiers à migrer mais absentes de `icons.ts`. Les ajouter dans la section appropriée.

- [ ] **Ajouter les icônes manquantes**

Ouvrir `src/lib/icons.ts` et ajouter dans les bonnes sections :

```ts
// Navigation & Layout (existant — ajouter)
export { ArrowUpDown01Icon as ChevronsUpDownIcon } from "@hugeicons/core-free-icons";
export { LayoutLeft01Icon as SidebarIcon } from "@hugeicons/core-free-icons";

// User & Auth (existant — ajouter)
export { SmartPhone01Icon as SmartphoneIcon } from "@hugeicons/core-free-icons";

// Communication (existant — ajouter)
export { Send01Icon as SendIcon } from "@hugeicons/core-free-icons";

// Status & Feedback (existant — ajouter)
export { Loading03Icon as LoadingIcon } from "@hugeicons/core-free-icons";
export { Loading03Icon as SpinnerIcon } from "@hugeicons/core-free-icons";

// Actions (existant — ajouter)
export { SquareArrowUpRightIcon as ExternalLinkIcon } from "@hugeicons/core-free-icons";
export { ArrowUp01Icon as ChevronUpIcon } from "@hugeicons/core-free-icons";

// Finance (nouvelle section)
// Finance
export { CreditCard01Icon as CreditCardIcon } from "@hugeicons/core-free-icons";

// Misc (existant — ajouter)
export { Briefcase01Icon as BriefcaseIcon } from "@hugeicons/core-free-icons";
```

> ⚠️ **Faux-amis à vérifier visuellement avant de valider :**
>
> - `ArrowUpDown01Icon` pour `ChevronsUpDownIcon` — vérifier que l'icône montre deux chevrons haut/bas
> - `LayoutLeft01Icon` pour `SidebarIcon` — vérifier que c'est bien une sidebar layout
> - `Send01Icon` pour `SendIcon` — vérifier l'icône "envoyer"
> - `ArrowUp01Icon` pour `ChevronUpIcon` — vérifier que c'est un chevron simple (pas une flèche pleine)

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "icons.ts"
```

Expected : aucune erreur sur `icons.ts`.

- [ ] **Commit**

```bash
git add apps/frontend/src/lib/icons.ts
git commit -m "feat(frontend): enrich icons.ts with missing HugeIcons mappings"
```

---

## Task 3 — Migrer les composants UI (@tabler/icons-react → HugeIcons)

**Files:** 20 fichiers dans `apps/frontend/src/components/ui/`

### Mapping complet @tabler → @/lib/icons

| @tabler             | @/lib/icons export   | Notes                           |
| ------------------- | -------------------- | ------------------------------- |
| `IconChevronDown`   | `ChevronDownIcon`    |                                 |
| `IconChevronUp`     | `ChevronUpIcon`      | Ajouté Task 2                   |
| `IconChevronLeft`   | `ChevronLeftIcon`    |                                 |
| `IconChevronRight`  | `ChevronRightIcon`   |                                 |
| `IconX`             | `XIcon`              |                                 |
| `IconCheck`         | `CheckIcon`          |                                 |
| `IconMinus`         | `MinusIcon`          |                                 |
| `IconDots`          | `MoreHorizontalIcon` |                                 |
| `IconSelector`      | `SortIcon`           | ⚠️ vérifier visuellement        |
| `IconLoader`        | `LoadingIcon`        | Ajouté Task 2, + `animate-spin` |
| `IconCircleCheck`   | `CheckCircleIcon`    |                                 |
| `IconInfoCircle`    | `InfoIcon`           |                                 |
| `IconAlertTriangle` | `AlertIcon`          |                                 |
| `IconAlertOctagon`  | `AlertSquareIcon`    |                                 |
| `IconLayoutSidebar` | `SidebarIcon`        | Ajouté Task 2                   |
| `IconSearch`        | `SearchIcon`         |                                 |

### Pattern de remplacement pour chaque fichier

```ts
// AVANT
import { IconChevronDown, IconX } from "@tabler/icons-react";
<IconChevronDown className="h-4 w-4" />

// APRÈS
import { ChevronDownIcon, XIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
<HugeiconsIcon icon={ChevronDownIcon} className="h-4 w-4" />
```

- [ ] **Migrer `ui/accordion.tsx`** — `IconChevronDown`, `IconChevronUp`
- [ ] **Migrer `ui/breadcrumb.tsx`** — `IconChevronRight`, `IconDots`
- [ ] **Migrer `ui/calendar.tsx`** — `IconChevronLeft`, `IconChevronRight`, `IconChevronDown`
- [ ] **Migrer `ui/carousel.tsx`** — `IconChevronLeft`, `IconChevronRight`
- [ ] **Migrer `ui/checkbox.tsx`** — `IconCheck`
- [ ] **Migrer `ui/command.tsx`** — `IconSearch`, `IconCheck`
- [ ] **Migrer `ui/combobox.tsx`** — `IconChevronDown`, `IconX`, `IconCheck`
- [ ] **Migrer `ui/context-menu.tsx`** — `IconChevronRight`, `IconCheck`
- [ ] **Migrer `ui/dialog.tsx`** — `IconX`
- [ ] **Migrer `ui/dropdown-menu.tsx`** — `IconCheck`, `IconChevronRight`
- [ ] **Migrer `ui/input-otp.tsx`** — `IconMinus`
- [ ] **Migrer `ui/menubar.tsx`** — `IconCheck`, `IconChevronRight`
- [ ] **Migrer `ui/native-select.tsx`** — `IconSelector`
- [ ] **Migrer `ui/navigation-menu.tsx`** — `IconChevronDown`
- [ ] **Migrer `ui/pagination.tsx`** — `IconChevronLeft`, `IconChevronRight`, `IconDots`
- [ ] **Migrer `ui/select.tsx`** — `IconSelector`, `IconCheck`, `IconChevronUp`, `IconChevronDown`
- [ ] **Migrer `ui/sheet.tsx`** — `IconX`
- [ ] **Migrer `ui/sidebar.tsx`** — `IconLayoutSidebar`
- [ ] **Migrer `ui/sonner.tsx`** — `IconCircleCheck`, `IconInfoCircle`, `IconAlertTriangle`, `IconAlertOctagon`, `IconLoader`
- [ ] **Migrer `ui/spinner.tsx`** — `IconLoader`

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "ui/"
```

Expected : aucune erreur dans `components/ui/`.

- [ ] **Commit**

```bash
git add apps/frontend/src/components/ui/
git commit -m "feat(frontend): migrate ui/ components from @tabler to HugeIcons"
```

---

## Task 4 — Migrer les composants auth (lucide-react → HugeIcons)

**Files:** `src/components/auth/` (28 fichiers) + `src/lib/auth/organization-plugin.tsx`

### Mapping complet lucide → @/lib/icons

| lucide            | @/lib/icons export   | Notes                |
| ----------------- | -------------------- | -------------------- |
| `Eye`             | `EyeIcon`            |                      |
| `EyeOff`          | `EyeOffIcon`         | ⚠️ vérifier faux-ami |
| `User2`           | `UserIcon`           |                      |
| `Briefcase`       | `BriefcaseIcon`      | Ajouté Task 2        |
| `Send`            | `SendIcon`           | Ajouté Task 2        |
| `Check`           | `CheckIcon`          |                      |
| `X`               | `XIcon`              |                      |
| `Clock`           | `ClockIcon`          |                      |
| `Filter`          | `FilterIcon`         |                      |
| `Search`          | `SearchIcon`         |                      |
| `ChevronDownIcon` | `ChevronDownIcon`    |                      |
| `ChevronUp`       | `ChevronUpIcon`      | Ajouté Task 2        |
| `Copy`            | `CopyIcon`           |                      |
| `CalendarIcon`    | `CalendarIcon`       |                      |
| `LogOut`          | `LogoutIcon`         |                      |
| `Pencil`          | `EditIcon`           | ⚠️ vérifier faux-ami |
| `Trash2`          | `TrashIcon`          |                      |
| `CheckCircle`     | `CheckCircleIcon`    |                      |
| `ChevronRight`    | `ChevronRightIcon`   |                      |
| `ExternalLink`    | `ExternalLinkIcon`   | Ajouté Task 2        |
| `UserPlus`        | `UserPlusIcon`       |                      |
| `ChevronsUpDown`  | `ChevronsUpDownIcon` | Ajouté Task 2        |
| `PlusCircle`      | `PlusIcon`           |                      |
| `Settings`        | `SettingsIcon`       |                      |
| `TriangleAlert`   | `AlertIcon`          | ⚠️ vérifier          |
| `Upload`          | `UploadIcon`         |                      |

- [ ] **Migrer `lib/auth/organization-plugin.tsx`** — `Briefcase`
- [ ] **Migrer `auth/reset-password.tsx`** — `Eye`, `EyeOff`
- [ ] **Migrer `auth/sign-up.tsx`** — `Eye`, `EyeOff`
- [ ] **Migrer `auth/additional-field.tsx`** — `CalendarIcon`, `Check`, `ChevronDownIcon`, `Copy`
- [ ] **Migrer `auth/user/user-avatar.tsx`** — `User2`
- [ ] **Migrer `auth/organization/organization.tsx`** — `Settings`, `User2`
- [ ] **Migrer `auth/organization/organization-logo.tsx`** — `Briefcase`
- [ ] **Migrer `auth/organization/organization-invitations-empty.tsx`** — `Send`
- [ ] **Migrer `auth/organization/slug-field.tsx`** — `Check`, `X`
- [ ] **Migrer `auth/organization/leave-organization-dialog.tsx`** — `LogOut`
- [ ] **Migrer `auth/organization/organization-row.tsx`** — `Settings`
- [ ] **Migrer `auth/organization/user-invitation-row.tsx`** — `Check`, `Clock`, `X`
- [ ] **Migrer `auth/organization/organization-invitations.tsx`** — `ChevronUp`, `Filter`, `Search`, `X`
- [ ] **Migrer `auth/organization/organization-invitation-row.tsx`** — `X`
- [ ] **Migrer `auth/organization/delete-organization-dialog.tsx`** — `TriangleAlert`
- [ ] **Migrer `auth/organization/create-organization-dialog.tsx`** — `Briefcase`
- [ ] **Migrer `auth/organization/invite-member-dialog.tsx`** — `UserPlus`
- [ ] **Migrer `auth/organization/organizations-empty.tsx`** — `Briefcase`
- [ ] **Migrer `auth/organization/organization-switcher.tsx`** — `ChevronsUpDown`, `PlusCircle`, `Settings`
- [ ] **Migrer `auth/organization/user-invitations-empty.tsx`** — `Send`
- [ ] **Migrer `auth/organization/change-organization-logo.tsx`** — `Trash2`, `Upload`
- [ ] **Migrer `auth/organization/remove-member-dialog.tsx`** — `Trash2`
- [ ] **Migrer `auth/organization/organization-members.tsx`** — `ChevronUp`, `Filter`, `Search`, `X`
- [ ] **Migrer `auth/organization/organization-member-row.tsx`** — `LogOut`, `Pencil`, `Trash2`

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "auth/"
```

Expected : aucune erreur dans `auth/`.

- [ ] **Commit**

```bash
git add apps/frontend/src/components/auth/ apps/frontend/src/lib/auth/
git commit -m "feat(frontend): migrate auth/ components from lucide to HugeIcons"
```

---

## Task 5 — Migrer header, sidebar, subscription (lucide-react → HugeIcons)

**Files:**

- `src/components/header.tsx`
- `src/components/sidebar.tsx`
- `src/app/(dashboard)/settings/(settings)/subscription/page.tsx`
- `src/app/(dashboard)/settings/(settings)/subscription/_components/subscription-usage.tsx`
- `src/app/(dashboard)/settings/(settings)/subscription/_components/subscription-billing-history.tsx`
- `src/app/(dashboard)/settings/(settings)/subscription/_components/subscription-plan-selector.tsx`
- `src/app/(dashboard)/settings/(settings)/subscription/_components/subscription-upgrade-dialog.tsx`
- `src/app/(dashboard)/settings/(settings)/subscription/_components/subscription-plan-card.tsx`

### Mapping supplémentaire

| lucide            | @/lib/icons export | Notes            |
| ----------------- | ------------------ | ---------------- |
| `LogOut`          | `LogoutIcon`       |                  |
| `Moon`            | `MoonIcon`         |                  |
| `Sun`             | `SunIcon`          |                  |
| `Users`           | `UsersIcon`        |                  |
| `ShieldCheck`     | `ShieldUserIcon`   | ⚠️ vérifier      |
| `ScrollText`      | `DocumentIcon`     | ⚠️ vérifier      |
| `Bell`            | `BellIcon`         |                  |
| `FileUp`          | `FileUploadIcon`   |                  |
| `Settings`        | `SettingsIcon`     |                  |
| `Webhook`         | `WebhookIcon`      |                  |
| `LayoutDashboard` | `DashboardIcon`    | ⚠️ vérifier      |
| `AlertCircle`     | `AlertCircleIcon`  |                  |
| `Loader2`         | `LoadingIcon`      | + `animate-spin` |
| `Smartphone`      | `SmartphoneIcon`   | Ajouté Task 2    |
| `CreditCard`      | `CreditCardIcon`   | Ajouté Task 2    |
| `Crown`           | `CrownIcon`        |                  |

- [ ] **Migrer `components/header.tsx`** — `LogOut`, `Moon`, `Sun`
- [ ] **Migrer `components/sidebar.tsx`** — `Users`, `ShieldCheck`, `ScrollText`, `Bell`, `FileUp`, `Settings`, `Webhook`, `LayoutDashboard`
- [ ] **Migrer `subscription/page.tsx`** — `AlertCircle`, `Loader2`, `Smartphone`
- [ ] **Migrer `subscription-usage.tsx`** — `AlertCircle`
- [ ] **Migrer `subscription-billing-history.tsx`** — `CreditCard`
- [ ] **Migrer `subscription-plan-selector.tsx`** — `CheckCircle`, `ChevronRight`
- [ ] **Migrer `subscription-upgrade-dialog.tsx`** — `AlertCircle`, `CheckCircle`, `ExternalLink`, `Loader2`
- [ ] **Migrer `subscription-plan-card.tsx`** — `CheckCircle`, `ChevronRight`, `Crown`

- [ ] **Vérifier la compilation globale**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1
```

Expected : 0 erreurs liées aux icônes.

- [ ] **Vérifier qu'aucun import lucide ou tabler ne reste**

```bash
cd apps/frontend && rg "from \"lucide-react\"" src -g "*.tsx" -g "*.ts" -l
rg "from \"@tabler/icons-react\"" src -g "*.tsx" -g "*.ts" -l
```

Expected : aucun fichier listé.

- [ ] **Commit final phase 1**

```bash
git add apps/frontend/src/components/header.tsx apps/frontend/src/components/sidebar.tsx apps/frontend/src/app/
git commit -m "feat(frontend): complete icon migration — lucide-react and @tabler removed"
```
