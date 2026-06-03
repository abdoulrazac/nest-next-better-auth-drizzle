# Settings Refactor — Design Spec

**Date:** 2026-06-03  
**Status:** Approved

## Goal

Replace all broken tRPC imports in `app/(dashboard)/settings/` with working code. Pages that have a real backend are fully wired. Pages with no backend become clean, compilable placeholder pages. The visual layout (left sidebar `SettingsNav`) is preserved unchanged.

## Constraints

- Keep the `(settings)/layout.tsx` + `SettingsNav` sidebar — no layout changes
- **All feature components live in `apps/frontend/src/features/settings/`** — same pattern as `features/users/`, `features/roles/`
- Route pages (`app/(dashboard)/settings/...`) are minimal wrappers that import from `features/settings/`
- UI language: French (labels, toasts, placeholders)
- Icons: `@/lib/icons` only — never import `@hugeicons/core-free-icons` directly
- `apiClient` from `@/lib/api` — object syntax: `apiClient.get({ url, query })`
- `zodResolver(schema as any) as any` workaround in all form files (Zod v4 + hookform v5)
- `PageHeader` default export from `@/components/page-header`
- Remove all `// @ts-nocheck`

---

## Section 1 — Layout: No Changes

`apps/frontend/src/app/(dashboard)/settings/(settings)/layout.tsx` and `_components/settings-nav.tsx` already match the reference layout. **Do not touch these files.**

---

## Section 2 — Pages To Fix

All feature components live in `apps/frontend/src/features/settings/`. Route pages are 5-line wrappers.

### 2a. General Settings Feature

**Feature files:**

- `features/settings/general/schema.ts` — Zod schemas
- `features/settings/general/hooks.ts` — TanStack Query hooks
- `features/settings/general/index.tsx` — `GeneralSettingsPage` component

**Route wrapper:** `settings/(settings)/general/page.tsx` → `import { GeneralSettingsPage } from "@/features/settings/general"`

Two `Card` sections on one page:

**Card 1 — Paramètres de l'application** (wired to `GET/PATCH /v1/settings/app`)

- App name (text input)
- Support email (email input)
- Maintenance mode (Switch)
- Save button — calls `PATCH /v1/settings/app`

**Card 2 — Mes préférences** (wired to `GET/PATCH /v1/settings/preferences`)

- Thème: light / dark / system (SingleSelect)
- Langue: fr / en (SingleSelect)
- Fuseau horaire (text Input)
- Save button — calls `PATCH /v1/settings/preferences`

Types from `@repo/validators/settings`: `AppSettingsResponse`, `UpdateAppSettings`, `UserPreferencesResponse`, `UpdateUserPreferences`.

Hooks: `useGetAppSettings`, `useUpdateAppSettings`, `useGetPreferences`, `useUpdatePreferences`.

Error handling: inline `<p className="text-sm text-destructive">` (no `ErrorState` from shared).

### 2b. Developers Feature — API Keys Tab

**Feature files:**

- `features/settings/developers/api-keys-tab.tsx` — fix broken imports, logic unchanged

Fix broken imports:

- `@/server/better-auth/client` → `@/lib/auth-client`
- `@/hooks/use-confirm-dialog` → `@/components/hooks/use-confirm-dialog`
- `@/components/shared` (ErrorState) → inline error JSX
- `@/hooks/use-auth` → use `authClient.useSession()` to get session
- All `@hugeicons/core-free-icons` direct imports → `@/lib/icons`
- Remove `// @ts-nocheck`

### 2c. Developers Feature — Webhooks Tab

**Feature files:**

- `features/settings/developers/hooks.ts` — TanStack Query hooks for webhooks CRUD
- `features/settings/developers/webhooks-tab.tsx` — full rewrite

**Route wrapper:** `settings/(settings)/developers/page.tsx` → import both tabs from `@/features/settings/developers/`

Webhooks wired to `WebhooksController`:

| Action | Endpoint                  |
| ------ | ------------------------- |
| List   | `GET /v1/webhooks`        |
| Create | `POST /v1/webhooks`       |
| Update | `PATCH /v1/webhooks/:id`  |
| Delete | `DELETE /v1/webhooks/:id` |

No "test" action (endpoint does not exist).

Types from `@repo/validators/webhooks`: `WebhookResponse`, `CreateWebhookInput`, `WebhooksPaginatedResponse`.

UI: table of webhooks + create/edit dialog (react-hook-form + Zod). Delete uses `useConfirmDialog` from `@/components/hooks/use-confirm-dialog`.

Hooks: `useListWebhooks`, `useCreateWebhook`, `useUpdateWebhook`, `useDeleteWebhook`.

---

## Section 3 — Placeholder Pages

These 9 pages have no backend. Each route page is replaced with a minimal placeholder. A shared `SettingsPlaceholder` component lives in `features/settings/placeholder.tsx`.

**`features/settings/placeholder.tsx`:**

```tsx
import PageHeader from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

interface SettingsPlaceholderProps {
  title: string;
  description: string;
}

export function SettingsPlaceholder({
  title,
  description,
}: SettingsPlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} variant="list" />
      <Card>
        <CardContent className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          Cette fonctionnalité sera disponible prochainement.
        </CardContent>
      </Card>
    </div>
  );
}
```

Each route page becomes:

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return <SettingsPlaceholder title="..." description="..." />;
}
```

| Route page                            | Title               | Description                           |
| ------------------------------------- | ------------------- | ------------------------------------- |
| `(settings)/page.tsx`                 | Vue d'ensemble      | Aperçu rapide de votre plateforme     |
| `(settings)/company/page.tsx`         | Données entreprise  | Informations légales et coordonnées   |
| `(settings)/fiscal-years/page.tsx`    | Exercices fiscaux   | Gestion des exercices fiscaux         |
| `(settings)/numbering/page.tsx`       | Numérotation        | Séquences et numérotation automatique |
| `(settings)/backup/page.tsx`          | Sauvegarde          | Sauvegardes automatiques              |
| `(settings)/data/page.tsx`            | Gestion des données | Import et export de données           |
| `(settings)/reminders/page.tsx`       | Relances            | Configuration des rappels de paiement |
| `(settings)/subscription/page.tsx`    | Abonnement          | Plan et facturation                   |
| `(settings)/dgi-integration/page.tsx` | Certification DGI   | Connexion aux services fiscaux        |

Sub-component files (e.g. `company/_components/`, `fiscal-years/_components/`) are left untouched — no longer imported.

---

## File Map

**New `features/settings/` structure:**

| Action | Path                                            |
| ------ | ----------------------------------------------- |
| Create | `features/settings/placeholder.tsx`             |
| Create | `features/settings/general/schema.ts`           |
| Create | `features/settings/general/hooks.ts`            |
| Create | `features/settings/general/index.tsx`           |
| Create | `features/settings/developers/hooks.ts`         |
| Create | `features/settings/developers/api-keys-tab.tsx` |
| Create | `features/settings/developers/webhooks-tab.tsx` |
| Create | `features/settings/developers/index.tsx`        |

**Route pages (wrappers only):**

| Action  | Path                                           |
| ------- | ---------------------------------------------- |
| Replace | `settings/(settings)/general/page.tsx`         |
| Replace | `settings/(settings)/developers/page.tsx`      |
| Replace | `settings/(settings)/page.tsx`                 |
| Replace | `settings/(settings)/company/page.tsx`         |
| Replace | `settings/(settings)/fiscal-years/page.tsx`    |
| Replace | `settings/(settings)/numbering/page.tsx`       |
| Replace | `settings/(settings)/backup/page.tsx`          |
| Replace | `settings/(settings)/data/page.tsx`            |
| Replace | `settings/(settings)/reminders/page.tsx`       |
| Replace | `settings/(settings)/subscription/page.tsx`    |
| Replace | `settings/(settings)/dgi-integration/page.tsx` |

All feature paths relative to `apps/frontend/src/`.  
All route paths relative to `apps/frontend/src/app/(dashboard)/`.
