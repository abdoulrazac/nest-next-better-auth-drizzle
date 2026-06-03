---
name: entity
description: "Scaffold a complete entity end-to-end: Drizzle schema, DB migration, validators, NestJS module+endpoints, API client regeneration, and all frontend pages (list, detail, form, select). Use when creating a brand-new entity from scratch."
---

# Full Entity Scaffold

## When to Use

- Créer une entité de zéro (ex: "payment", "project", "category")
- Besoin du full stack : base de données → API → pages

## Prerequisites

- Avoir identifié les champs, relations et statuts de l'entité
- Savoir dans quel module NestJS l'entité appartient

## Procedure — 10 Steps

### Step 1 — Drizzle Schema (`packages/db/src/schema/<entity>.ts`)

```ts
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const entities = pgTable("entities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  // champs spécifiques
  description: text("description"),
  organizationId: text("organization_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
```

### Step 2 — Export dans packages/db

Ajouter dans `packages/db/src/index.ts` :

```ts
export * from "./schema/entity";
```

### Step 3 — Migration

```bash
cd packages/db && bun run db:generate
bun run db:migrate
```

### Step 4 — Validators (`packages/validators/src/<entity>/`)

Utiliser le skill **nest-validator** pour créer les schemas Zod.

### Step 5 — NestJS Module

Utiliser le skill **nest-module** pour créer module + controller + service + repository.

### Step 6 — Endpoints

Utiliser le skill **nest-endpoint** pour chaque endpoint (list, get, create, update, delete).

### Step 7 — Regénérer l'API client

```bash
cd packages/api-client && bun run generate
```

Vérifier que les hooks `client.entities.*` sont disponibles.

### Step 8 — Frontend : Hook + Pages

Utiliser les skills dans l'ordre :

1. **embedded-table** → créer `hooks.ts` (centralised hook)
2. **list-page** → créer `index.tsx` + `columns.tsx`
3. **detail-page** → créer `[entityId]/page.tsx`
4. **detail-sheet** → créer `detail-sheet.tsx`
5. **entity-select** → créer `_components/entity-select.tsx` (si utilisé dans d'autres formulaires)

### Step 9 — Navigation

Ajouter dans `src/components/layout/sidebar-data.ts` :

```ts
{ title: "Entités", url: "/module/entities", icon: EntityIcon }
```

### Step 10 — Vérification

```bash
cd apps/frontend && bun run tsc --noEmit
cd apps/backend && bun run build
```

## Checklist

- [ ] Schema Drizzle avec `id` (cuid2), `createdAt`, `updatedAt`
- [ ] Export dans `packages/db/src/index.ts`
- [ ] Migration exécutée
- [ ] Validators Zod dans `packages/validators`
- [ ] Module NestJS (module + controller + service + repository)
- [ ] Endpoints : list (paginé + filtres), get, create, update, delete
- [ ] API client regénéré — `client.<entity>.*` disponibles
- [ ] Hook centralisé (`hooks.ts`) — mutations, handlers, ConfirmDialogComponent
- [ ] Column factory (`columns.tsx`)
- [ ] List page (`index.tsx`)
- [ ] Detail page (`[entityId]/page.tsx`)
- [ ] Detail sheet (`detail-sheet.tsx`) — reçoit handlers via props
- [ ] Create/edit form (si nécessaire)
- [ ] Entity select (si utilisé dans d'autres formulaires)
- [ ] Nav item dans `sidebar-data.ts`
- [ ] Labels, toasts, messages en français
