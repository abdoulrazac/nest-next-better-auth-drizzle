# Plan 1 — Fondations Monorepo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre en place la structure complète du monorepo avec les packages partagés (`ui`, `validators`, `db`), la configuration DevOps (Docker Compose, Husky, commitlint) et le CI GitHub Actions.

**Architecture:** Monorepo Turborepo + Bun workspaces. Les packages `@repo/ui`, `@repo/validators` et `@repo/db` sont des workspaces internes importés par les apps. Les configs ESLint et TypeScript sont partagées via `@repo/eslint-config` et `@repo/typescript-config` (déjà en place).

**Tech Stack:** Turborepo, Bun, Drizzle ORM, Zod, Shadcn/ui, Docker Compose, Husky, lint-staged, commitlint, GitHub Actions

---

## Fichiers créés ou modifiés

### Racine
- Modifier : `package.json` — ajouter devDependencies (husky, lint-staged, commitlint)
- Modifier : `turbo.json` — ajouter tâche `db:generate`, `db:migrate`
- Créer : `docker-compose.yml`
- Créer : `docker-compose.test.yml`
- Créer : `.env.example`
- Créer : `.husky/pre-commit`
- Créer : `.husky/commit-msg`
- Créer : `commitlint.config.ts`
- Créer : `.lintstagedrc.mjs`

### `packages/validators`
- Créer : `package.json`
- Créer : `tsconfig.json`
- Créer : `src/index.ts`
- Créer : `src/auth.ts`
- Créer : `src/accounts.ts`
- Créer : `src/files.ts`
- Créer : `src/notifications.ts`
- Créer : `src/settings.ts`
- Créer : `src/webhooks.ts`

### `packages/db`
- Créer : `package.json`
- Créer : `tsconfig.json`
- Créer : `drizzle.config.ts`
- Créer : `src/index.ts`
- Créer : `src/schema/index.ts`
- Créer : `src/schema/auth.ts`
- Créer : `src/schema/accounts.ts`
- Créer : `src/schema/files.ts`
- Créer : `src/schema/notifications.ts`
- Créer : `src/schema/settings.ts`
- Créer : `src/schema/audit-logs.ts`
- Créer : `src/schema/webhooks.ts`

### `packages/ui`
- Modifier : `package.json` — ajouter Shadcn/ui, Tailwind, Radix
- Modifier : `src/` — ajouter composants Shadcn de base

### `.github/workflows`
- Créer : `.github/workflows/ci.yml`
- Créer : `.github/workflows/release.yml`

---

## Task 1 : Docker Compose

**Files:**
- Créer : `docker-compose.yml`
- Créer : `docker-compose.test.yml`
- Créer : `.env.example`

- [ ] **Step 1 : Créer `docker-compose.yml`**

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

- [ ] **Step 2 : Créer `docker-compose.test.yml`**

```yaml
# docker-compose.test.yml
services:
  postgres_test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

- [ ] **Step 3 : Créer `.env.example`**

```bash
# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app

# =============================================================================
# AUTH (Better-Auth)
# =============================================================================
BETTER_AUTH_SECRET=change-me-with-a-random-32-char-string
BETTER_AUTH_URL=http://localhost:3000

# =============================================================================
# OAUTH
# =============================================================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# =============================================================================
# S3 / MINIO
# =============================================================================
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1

# =============================================================================
# REDIS
# =============================================================================
REDIS_URL=redis://localhost:6379
```

- [ ] **Step 4 : Démarrer les services et vérifier**

```bash
docker compose up -d
docker compose ps
```

Résultat attendu : les trois services `postgres`, `redis`, `minio` sont en état `healthy`.

- [ ] **Step 5 : Commit**

```bash
git add docker-compose.yml docker-compose.test.yml .env.example
git commit -m "chore: add docker compose for dev and test environments"
```

---

## Task 2 : Husky + lint-staged + commitlint

**Files:**
- Modifier : `package.json`
- Créer : `.husky/pre-commit`
- Créer : `.husky/commit-msg`
- Créer : `commitlint.config.ts`
- Créer : `.lintstagedrc.mjs`

- [ ] **Step 1 : Installer les dépendances**

```bash
bun add -D husky lint-staged @commitlint/cli @commitlint/config-conventional -w
```

- [ ] **Step 2 : Initialiser Husky**

```bash
bunx husky init
```

- [ ] **Step 3 : Créer `.husky/pre-commit`**

```bash
bunx lint-staged
```

- [ ] **Step 4 : Créer `.husky/commit-msg`**

```bash
bunx --no -- commitlint --edit $1
```

- [ ] **Step 5 : Créer `commitlint.config.ts`**

```typescript
// commitlint.config.ts
import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "revert",
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 100],
  },
};

export default config;
```

- [ ] **Step 6 : Créer `.lintstagedrc.mjs`**

```javascript
// .lintstagedrc.mjs
export default {
  "*.{ts,tsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};
```

- [ ] **Step 7 : Ajouter le script prepare dans `package.json`**

Dans `package.json` racine, ajouter dans `"scripts"` :

```json
"prepare": "husky"
```

- [ ] **Step 8 : Vérifier que commitlint fonctionne**

```bash
echo "bad commit message" | bunx commitlint
```

Résultat attendu : erreur avec `subject may not be empty` et `type may not be empty`.

```bash
echo "feat: add docker compose" | bunx commitlint
```

Résultat attendu : aucune erreur.

- [ ] **Step 9 : Commit**

```bash
git add package.json .husky/ commitlint.config.ts .lintstagedrc.mjs
git commit -m "chore: add husky, lint-staged and commitlint"
```

---

## Task 3 : Package `@repo/validators`

**Files:**
- Créer : `packages/validators/package.json`
- Créer : `packages/validators/tsconfig.json`
- Créer : `packages/validators/src/index.ts`
- Créer : `packages/validators/src/auth.ts`
- Créer : `packages/validators/src/accounts.ts`
- Créer : `packages/validators/src/files.ts`
- Créer : `packages/validators/src/notifications.ts`
- Créer : `packages/validators/src/settings.ts`
- Créer : `packages/validators/src/webhooks.ts`

- [ ] **Step 1 : Créer `packages/validators/package.json`**

```json
{
  "name": "@repo/validators",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./auth": "./src/auth.ts",
    "./accounts": "./src/accounts.ts",
    "./files": "./src/files.ts",
    "./notifications": "./src/notifications.ts",
    "./settings": "./src/settings.ts",
    "./webhooks": "./src/webhooks.ts"
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "typescript": "5.9.2"
  },
  "dependencies": {
    "zod": "^3.25.0"
  }
}
```

- [ ] **Step 2 : Créer `packages/validators/tsconfig.json`**

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3 : Créer `packages/validators/src/auth.ts`**

```typescript
// packages/validators/src/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

- [ ] **Step 4 : Créer `packages/validators/src/accounts.ts`**

```typescript
// packages/validators/src/accounts.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export const updateUserSchema = createUserSchema.partial().omit({ email: true });

export const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  permissions: z.array(z.string()).min(1),
});

export const updateRoleSchema = createRoleSchema.partial();

export const auditLogQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
```

- [ ] **Step 5 : Créer `packages/validators/src/files.ts`**

```typescript
// packages/validators/src/files.ts
import { z } from "zod";

export const uploadFileSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive().max(100 * 1024 * 1024), // 100MB max
});

export const fileQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  mimeType: z.string().optional(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type FileQuery = z.infer<typeof fileQuerySchema>;
```

- [ ] **Step 6 : Créer `packages/validators/src/notifications.ts`**

```typescript
// packages/validators/src/notifications.ts
import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  inApp: z.boolean().default(true),
});

export const markAsReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
```

- [ ] **Step 7 : Créer `packages/validators/src/settings.ts`**

```typescript
// packages/validators/src/settings.ts
import { z } from "zod";

export const appSettingsSchema = z.object({
  appName: z.string().min(1).max(100),
  supportEmail: z.string().email(),
  maintenanceMode: z.boolean().default(false),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["fr", "en"]).default("fr"),
  timezone: z.string().default("Europe/Paris"),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
```

- [ ] **Step 8 : Créer `packages/validators/src/webhooks.ts`**

```typescript
// packages/validators/src/webhooks.ts
import { z } from "zod";

export const createWebhookSchema = z.object({
  name: z.string().min(2).max(100),
  url: z.string().url("URL invalide"),
  events: z.array(z.string()).min(1, "Au moins un événement requis"),
  secret: z.string().min(16).optional(),
});

export const updateWebhookSchema = createWebhookSchema.partial();

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
```

- [ ] **Step 9 : Créer `packages/validators/src/index.ts`**

```typescript
// packages/validators/src/index.ts
export * from "./auth";
export * from "./accounts";
export * from "./files";
export * from "./notifications";
export * from "./settings";
export * from "./webhooks";
```

- [ ] **Step 10 : Installer les dépendances et vérifier les types**

```bash
bun install
bun check-types --filter @repo/validators
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Step 11 : Commit**

```bash
git add packages/validators/
git commit -m "feat: add @repo/validators package with zod schemas"
```

---

## Task 4 : Package `@repo/db`

**Files:**
- Créer : `packages/db/package.json`
- Créer : `packages/db/tsconfig.json`
- Créer : `packages/db/drizzle.config.ts`
- Créer : `packages/db/src/index.ts`
- Créer : `packages/db/src/schema/index.ts`
- Créer : `packages/db/src/schema/auth.ts`
- Créer : `packages/db/src/schema/accounts.ts`
- Créer : `packages/db/src/schema/files.ts`
- Créer : `packages/db/src/schema/notifications.ts`
- Créer : `packages/db/src/schema/settings.ts`
- Créer : `packages/db/src/schema/audit-logs.ts`
- Créer : `packages/db/src/schema/webhooks.ts`

- [ ] **Step 1 : Créer `packages/db/package.json`**

```json
{
  "name": "@repo/db",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "check-types": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "drizzle-kit": "^0.31.0",
    "typescript": "5.9.2"
  },
  "dependencies": {
    "drizzle-orm": "^0.43.0",
    "postgres": "^3.4.5"
  }
}
```

- [ ] **Step 2 : Créer `packages/db/tsconfig.json`**

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*", "drizzle.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3 : Créer `packages/db/drizzle.config.ts`**

```typescript
// packages/db/drizzle.config.ts
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
```

- [ ] **Step 4 : Créer `packages/db/src/schema/auth.ts`**

Tables requises par Better-Auth. Voir la doc Better-Auth pour le schéma complet.

```typescript
// packages/db/src/schema/auth.ts
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("member"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- [ ] **Step 5 : Créer `packages/db/src/schema/accounts.ts`**

```typescript
// packages/db/src/schema/accounts.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const role = pgTable("role", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  permissions: text("permissions").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userRole = pgTable("user_role", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => role.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

- [ ] **Step 6 : Créer `packages/db/src/schema/audit-logs.ts`**

```typescript
// packages/db/src/schema/audit-logs.ts
import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

- [ ] **Step 7 : Créer `packages/db/src/schema/files.ts`**

```typescript
// packages/db/src/schema/files.ts
import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const file = pgTable("file", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  bucket: text("bucket").notNull(),
  key: text("key").notNull().unique(),
  url: text("url").notNull(),
  uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 8 : Créer `packages/db/src/schema/notifications.ts`**

```typescript
// packages/db/src/schema/notifications.ts
import { boolean, pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const notification = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: jsonb("data"),
  read: boolean("read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

- [ ] **Step 9 : Créer `packages/db/src/schema/settings.ts`**

```typescript
// packages/db/src/schema/settings.ts
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const appSetting = pgTable("app_setting", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userPreference = pgTable("user_preference", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"),
  language: text("language").notNull().default("fr"),
  timezone: text("timezone").notNull().default("Europe/Paris"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 10 : Créer `packages/db/src/schema/webhooks.ts`**

```typescript
// packages/db/src/schema/webhooks.ts
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const webhook = pgTable("webhook", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: text("events").array().notNull(),
  secret: text("secret"),
  active: boolean("active").notNull().default(true),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const webhookDelivery = pgTable("webhook_delivery", {
  id: uuid("id").primaryKey().defaultRandom(),
  webhookId: uuid("webhook_id")
    .notNull()
    .references(() => webhook.id, { onDelete: "cascade" }),
  event: text("event").notNull(),
  payload: text("payload").notNull(),
  statusCode: text("status_code"),
  response: text("response"),
  success: boolean("success").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

- [ ] **Step 11 : Créer `packages/db/src/schema/index.ts`**

```typescript
// packages/db/src/schema/index.ts
export * from "./auth";
export * from "./accounts";
export * from "./audit-logs";
export * from "./files";
export * from "./notifications";
export * from "./settings";
export * from "./webhooks";
```

- [ ] **Step 12 : Créer `packages/db/src/index.ts`**

```typescript
// packages/db/src/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);

export const db = drizzle(client, { schema });

export * from "./schema";
export { schema };
```

- [ ] **Step 13 : Installer les dépendances et vérifier les types**

```bash
bun install
bun check-types --filter @repo/db
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Step 14 : Générer la première migration**

S'assurer que Docker Compose est démarré, puis :

```bash
cd packages/db
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app bun db:generate
```

Résultat attendu : un dossier `packages/db/migrations/` créé avec un fichier SQL.

- [ ] **Step 15 : Appliquer la migration**

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app bun db:migrate
```

Résultat attendu : `All migrations applied successfully`.

- [ ] **Step 16 : Commit**

```bash
git add packages/db/
git commit -m "feat: add @repo/db package with drizzle schemas and initial migration"
```

---

## Task 5 : Package `@repo/ui` — Shadcn/ui

**Files:**
- Modifier : `packages/ui/package.json`
- Modifier : `packages/ui/src/` — composants Shadcn

- [ ] **Step 1 : Installer les dépendances Shadcn/ui dans `@repo/ui`**

```bash
bun add -D tailwindcss @tailwindcss/postcss autoprefixer --filter @repo/ui
bun add class-variance-authority clsx tailwind-merge lucide-react --filter @repo/ui
bun add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-toast @radix-ui/react-separator @radix-ui/react-avatar @radix-ui/react-tooltip --filter @repo/ui
```

- [ ] **Step 2 : Mettre à jour `packages/ui/package.json`**

Ajouter dans `exports` :

```json
{
  "exports": {
    "./*": "./src/*.tsx",
    "./lib/*": "./src/lib/*.ts"
  }
}
```

- [ ] **Step 3 : Créer `packages/ui/src/lib/utils.ts`**

```typescript
// packages/ui/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4 : Créer `packages/ui/src/button.tsx`** (remplace le fichier existant)

```typescript
// packages/ui/src/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 5 : Créer `packages/ui/src/input.tsx`**

```typescript
// packages/ui/src/input.tsx
import * as React from "react";
import { cn } from "./lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

- [ ] **Step 6 : Créer `packages/ui/src/label.tsx`**

```typescript
// packages/ui/src/label.tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
```

- [ ] **Step 7 : Vérifier les types**

```bash
bun check-types --filter @repo/ui
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Step 8 : Commit**

```bash
git add packages/ui/
git commit -m "feat: setup @repo/ui with shadcn base components"
```

---

## Task 6 : CI GitHub Actions

**Files:**
- Créer : `.github/workflows/ci.yml`
- Créer : `.github/workflows/release.yml`

- [ ] **Step 1 : Créer `.github/workflows/ci.yml`**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun lint

  typecheck:
    name: Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun check-types

  test-backend:
    name: Tests Backend
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: app_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - name: Run migrations
        run: bun db:migrate --filter @repo/db
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/app_test
      - name: Run unit tests
        run: bun test --filter backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/app_test
          BETTER_AUTH_SECRET: test-secret-32-characters-minimum
          BETTER_AUTH_URL: http://localhost:3000

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun build
```

- [ ] **Step 2 : Créer `.github/workflows/release.yml`**

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  build-verification:
    name: Build Verification
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun build
      - name: Build success
        run: echo "Build successful on main"
```

- [ ] **Step 3 : Vérifier la syntaxe des workflows**

```bash
bunx action-validator .github/workflows/ci.yml
bunx action-validator .github/workflows/release.yml
```

Si `action-validator` n'est pas disponible, vérifier manuellement que l'indentation YAML est correcte.

- [ ] **Step 4 : Commit**

```bash
git add .github/
git commit -m "ci: add github actions workflows for ci and release"
```

---

## Task 7 : Mise à jour `turbo.json`

**Files:**
- Modifier : `turbo.json`

- [ ] **Step 1 : Mettre à jour `turbo.json`**

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

- [ ] **Step 2 : Vérifier que Turborepo parse le fichier correctement**

```bash
bunx turbo ls
```

Résultat attendu : liste des apps et packages du monorepo sans erreur.

- [ ] **Step 3 : Commit**

```bash
git add turbo.json
git commit -m "chore: update turbo.json with test and db tasks"
```

---

## Task 8 : Vérification finale

- [ ] **Step 1 : Vérifier l'intégralité du build**

```bash
bun install
bun check-types
bun lint
```

Résultat attendu : aucune erreur de type, aucune erreur ESLint.

- [ ] **Step 2 : Vérifier que les packages s'importent correctement**

Créer un fichier temporaire `test-imports.ts` à la racine :

```typescript
import { loginSchema } from "@repo/validators/auth";
import { db } from "@repo/db";
import { Button } from "@repo/ui/button";

console.log(loginSchema, db, Button);
```

```bash
bunx tsc --noEmit test-imports.ts
```

Résultat attendu : aucune erreur de résolution de modules.

Supprimer le fichier :

```bash
rm test-imports.ts
```

- [ ] **Step 3 : Commit final**

```bash
git add -A
git commit -m "chore: finalize monorepo foundations"
```
