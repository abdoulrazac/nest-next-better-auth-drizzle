---
name: drizzle-migration
description: >
  Use this skill whenever you need to add a new database table, modify an
  existing schema, or run a migration in this monorepo. Covers schema file
  creation, export wiring, migration generation and application, and importing
  the table in the NestJS backend.
---

# Drizzle Migration Skill

## Project layout

```
packages/db/
  src/
    schema/          ← one file per domain entity (or grouped by domain)
      index.ts       ← barrel that re-exports every schema file
    index.ts         ← exports `db`, `schema`, and re-exports schema barrel
    migrate.ts       ← standalone migration runner
    seed.ts
  migrations/        ← generated SQL files (drizzle-kit output, do not edit)
  drizzle.config.ts  ← points to src/schema/index.ts and ./migrations
  package.json       ← package name: @repo/db
```

drizzle.config.ts key settings:

- `schema`: `"./src/schema/index.ts"`
- `out`: `"./migrations"`
- `dialect`: `"postgresql"`

---

## Step-by-step workflow

### 1. Create the schema file

Create `packages/db/src/schema/<your-domain>.ts`.

Use `pgTable` from `drizzle-orm/pg-core`. Follow the conventions used by
existing schema files (snake_case column names, camelCase TypeScript keys,
`uuid` primary keys with `.defaultRandom()`, `timestamp` columns for
`createdAt` / `updatedAt`).

**Template:**

```ts
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth"; // only if you need a FK to the auth user

export const widget = pgTable(
  "widget",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // FK example — omit if not needed
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("widget_owner_id_idx").on(table.ownerId),
    // uniqueIndex("widget_name_unique_idx").on(table.name),
  ],
);

// Inferred types — useful for service layer typing
export type Widget = typeof widget.$inferSelect;
export type NewWidget = typeof widget.$inferInsert;
```

Common column helpers available in `drizzle-orm/pg-core`:
`uuid`, `text`, `integer`, `bigint`, `boolean`, `jsonb`, `timestamp`,
`index`, `uniqueIndex`, `pgTable`, `pgEnum`, `customType`

### 2. Export from the schema barrel

Open `packages/db/src/schema/index.ts` and add:

```ts
export * from "./<your-domain>";
```

**Pitfall:** Forgetting this step means `@repo/db` will not expose your table
and drizzle-kit will not pick it up during generation.

### 3. Build the package (if TypeScript errors appear downstream)

```bash
# from repo root
bun run --filter @repo/db build
```

This compiles to `packages/db/dist/`. Most dev workflows skip this step because
consumers reference `src/` via TypeScript path aliases, but it is required
before publishing or running in production.

### 4. Generate the migration SQL

Always run drizzle-kit commands **from the `packages/db/` directory** (the
directory that contains `drizzle.config.ts`).

```bash
cd packages/db
DATABASE_URL=<your-local-url> bun run db:generate
```

Or from the repo root using the workspace filter:

```bash
DATABASE_URL=<your-local-url> bun run --filter @repo/db db:generate
```

This writes a new `.sql` file to `packages/db/migrations/`. Commit this file
alongside your schema changes.

### 5. Apply the migration

```bash
cd packages/db
DATABASE_URL=<your-local-url> bun run db:migrate
```

Or from repo root:

```bash
DATABASE_URL=<your-local-url> bun run --filter @repo/db db:migrate
```

**Pitfall:** Running `drizzle-kit migrate` from the repo root (instead of
`packages/db/`) will fail because it cannot find `drizzle.config.ts`.

### 6. Use the table in the NestJS backend

Import from `@repo/db` (the package name declared in `packages/db/package.json`):

```ts
import { db, widget } from "@repo/db";
// or for just the type
import type { Widget, NewWidget } from "@repo/db";

// query example
const widgets = await db
  .select()
  .from(widget)
  .where(eq(widget.ownerId, userId));
```

The `db` instance is a drizzle client already wired to `postgres`. Do not
create a second client in the backend — re-use the one exported by `@repo/db`.

---

## Common pitfalls

| Pitfall                             | Fix                                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| Table not found after adding schema | Export it from `packages/db/src/schema/index.ts`                                              |
| `drizzle-kit` cannot find config    | Run scripts from `packages/db/`, not repo root                                                |
| Migration generated but not applied | Run `db:migrate` after `db:generate`                                                          |
| FK column type mismatch             | `user.id` is `text` in better-auth; FK columns referencing it must also be `text`, not `uuid` |
| Stale dist in backend               | Run `bun run --filter @repo/db build` after schema changes in some setups                     |
| `DATABASE_URL` not set              | Export it in your shell or prefix the command: `DATABASE_URL=... bun run db:generate`         |

---

## Companion skill

When adding a new table, also create matching Zod validators in
`packages/validators/` so the NestJS backend can validate DTOs.  
See the **nest-validator** skill for that workflow.

---

## Available scripts (packages/db/package.json)

| Script        | Purpose                                         |
| ------------- | ----------------------------------------------- |
| `db:generate` | Generate SQL migration from current schema diff |
| `db:migrate`  | Apply pending migrations to the database        |
| `db:studio`   | Open Drizzle Studio (visual DB browser)         |
| `db:seed`     | Run `src/seed.ts`                               |
| `build`       | Compile TypeScript to `dist/`                   |
