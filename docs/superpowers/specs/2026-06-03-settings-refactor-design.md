# Settings Refactor — Design Spec

**Date:** 2026-06-03  
**Status:** Approved

## Goal

Replace all broken tRPC imports in `app/(dashboard)/settings/` with working code. Pages that have a real backend are fully wired. Pages with no backend become clean, compilable placeholder pages. The visual layout (left sidebar `SettingsNav`) is preserved unchanged.

## Constraints

- Keep the `(settings)/layout.tsx` + `SettingsNav` sidebar — no layout changes
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

### 2a. General Settings Page

**File:** `settings/(settings)/general/_components/general-settings-form.tsx`  
**New files:** `settings/(settings)/general/_components/schema.ts`, `settings/(settings)/general/_components/hooks.ts`

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

Types come from `@repo/validators/settings`:

- `AppSettingsResponse`, `UpdateAppSettings`
- `UserPreferencesResponse`, `UpdateUserPreferences`

Schema file defines local Zod schemas matching those types.  
Hooks file exports: `useGetAppSettings`, `useUpdateAppSettings`, `useGetPreferences`, `useUpdatePreferences`.

Error handling: inline `<p className="text-sm text-destructive">` (no `ErrorState` from shared).

### 2b. Developers Page — API Keys Tab

**File:** `settings/(settings)/developers/_components/api-keys-tab.tsx`

Fix broken imports only — logic stays the same:

- `@/server/better-auth/client` → `@/lib/auth-client`
- `@/hooks/use-confirm-dialog` → `@/components/hooks/use-confirm-dialog`
- `@/components/shared` (ErrorState) → inline error JSX
- `@/hooks/use-auth` → use `authClient.useSession()` to get session
- All `@hugeicons/core-free-icons` direct imports → `@/lib/icons`
- Remove `// @ts-nocheck`

### 2c. Developers Page — Webhooks Tab

**File:** `settings/(settings)/developers/_components/webhooks-tab.tsx`

Full rewrite — replace tRPC with `apiClient` + TanStack Query wired to `WebhooksController`:

| Action | Endpoint                  |
| ------ | ------------------------- |
| List   | `GET /v1/webhooks`        |
| Create | `POST /v1/webhooks`       |
| Update | `PATCH /v1/webhooks/:id`  |
| Delete | `DELETE /v1/webhooks/:id` |

No "test" action (endpoint does not exist).

Types from `@repo/validators/webhooks`: `WebhookResponse`, `CreateWebhookInput`, `WebhooksPaginatedResponse`.

UI keeps same structure as old project: table of webhooks + create dialog.  
Create/edit dialog uses react-hook-form + Zod schema (name, url, events array, optional secret).  
Delete uses `useConfirmDialog` from `@/components/hooks/use-confirm-dialog`.

New hooks file: `settings/(settings)/developers/_components/hooks.ts` — exports `useListWebhooks`, `useCreateWebhook`, `useUpdateWebhook`, `useDeleteWebhook`.

---

## Section 3 — Placeholder Pages

These 9 pages have no backend. Each is replaced with a minimal placeholder that compiles cleanly.

**Pattern for each placeholder:**

```tsx
import PageHeader from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function XxxPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="<titre>" description="<description>" variant="list" />
      <Card>
        <CardContent className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          Cette fonctionnalité sera disponible prochainement.
        </CardContent>
      </Card>
    </div>
  );
}
```

| File                                  | Title               | Description                           |
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

Sub-component files (e.g. `company/_components/`, `fiscal-years/_components/`) are left untouched — they are no longer imported after the page refactor.

---

## File Map

| Action      | Path                                                                |
| ----------- | ------------------------------------------------------------------- |
| Create      | `settings/(settings)/general/_components/schema.ts`                 |
| Create      | `settings/(settings)/general/_components/hooks.ts`                  |
| Rewrite     | `settings/(settings)/general/_components/general-settings-form.tsx` |
| Create      | `settings/(settings)/developers/_components/hooks.ts`               |
| Fix imports | `settings/(settings)/developers/_components/api-keys-tab.tsx`       |
| Rewrite     | `settings/(settings)/developers/_components/webhooks-tab.tsx`       |
| Replace     | `settings/(settings)/page.tsx`                                      |
| Replace     | `settings/(settings)/company/page.tsx`                              |
| Replace     | `settings/(settings)/fiscal-years/page.tsx`                         |
| Replace     | `settings/(settings)/numbering/page.tsx`                            |
| Replace     | `settings/(settings)/backup/page.tsx`                               |
| Replace     | `settings/(settings)/data/page.tsx`                                 |
| Replace     | `settings/(settings)/reminders/page.tsx`                            |
| Replace     | `settings/(settings)/subscription/page.tsx`                         |
| Replace     | `settings/(settings)/dgi-integration/page.tsx`                      |

All paths relative to `apps/frontend/src/app/(dashboard)/`.
