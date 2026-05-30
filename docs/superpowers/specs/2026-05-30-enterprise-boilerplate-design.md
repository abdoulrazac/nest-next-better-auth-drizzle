# Enterprise Boilerplate Design

**Date:** 2026-05-30  
**Stack:** NestJS (Fastify) + Drizzle + Better-Auth / Next.js + Shadcn + Zod / Next.js + Fumadocs  
**Cible:** Starter généraliste publié sur GitHub, orienté moyenne/grande entreprise

---

## 1. Contexte & Objectifs

Ce boilerplate est un template GitHub généraliste destiné à être cloné pour démarrer de nouveaux projets enterprise. Il doit satisfaire trois priorités équilibrées :

- **Scalabilité technique** — architecture modulaire par domaine, prête pour des équipes multiples
- **Sécurité & conformité** — RBAC granulaire, audit logs, gestion fine des sessions
- **Maintenabilité long terme** — conventions strictes, structure imposée, facile à onboarder

L'architecture est **mono-tenant par défaut**, préparée pour évoluer vers le multi-tenant via le plugin `organization` de Better-Auth.

---

## 2. Structure du Monorepo

Turborepo + Bun workspaces.

```
nest-next-better-auth-drizzle/
├── apps/
│   ├── backend/          # NestJS — API REST
│   ├── frontend/         # Next.js — Dashboard
│   └── web/              # Next.js + Fumadocs — Site marketing + Documentation
├── packages/
│   ├── ui/               # Composants Shadcn/ui partagés
│   ├── validators/       # Schémas Zod partagés (source de vérité)
│   ├── db/               # Drizzle schema + migrations + client
│   ├── typescript-config/
│   └── eslint-config/
├── .github/
│   └── workflows/
├── docker-compose.yml
├── docker-compose.test.yml
├── .env.example
└── README.md
```

**Règles de dépendances entre packages :**
- `@repo/validators` → importé par backend ET frontend
- `@repo/db` → importé uniquement par le backend
- `@repo/ui` → importé par frontend ET web

---

## 3. Backend (NestJS)

### 3.1 Structure

```
apps/backend/src/
├── main.ts                    # Bootstrap — bodyParser: false obligatoire
├── app.module.ts
├── config/
│   └── env.ts                 # Validation env via Zod au démarrage
├── auth/
│   ├── auth.ts                # Config Better-Auth (plugins: admin, access control)
│   ├── auth.module.ts         # AuthModule.forRoot({ auth })
│   └── hooks/
│       └── user-create.hook.ts
├── common/
│   ├── decorators/            # @CurrentUser (wrapper @Session)
│   ├── interceptors/
│   │   └── audit-log.interceptor.ts
│   └── pipes/
│       └── zod-validation.pipe.ts
└── modules/
    ├── accounts/
    │   ├── accounts.module.ts
    │   ├── users/
    │   │   ├── users.controller.ts
    │   │   ├── users.service.ts
    │   │   └── users.repository.ts
    │   ├── roles/
    │   │   ├── roles.controller.ts
    │   │   ├── roles.service.ts
    │   │   └── roles.repository.ts
    │   └── audit-logs/
    │       ├── audit-logs.controller.ts
    │       ├── audit-logs.service.ts
    │       └── audit-logs.repository.ts
    ├── notifications/
    │   ├── notifications.module.ts
    │   ├── email/
    │   └── in-app/
    ├── files/
    │   ├── files.module.ts
    │   ├── upload/
    │   ├── storage/            # Abstraction S3 (MinIO par défaut)
    │   └── metadata/           # Métadonnées en DB (nom, taille, url, owner)
    ├── settings/
    │   ├── settings.module.ts
    │   ├── app-settings/
    │   └── user-preferences/
    ├── webhooks/
    │   ├── webhooks.module.ts
    │   ├── endpoints/
    │   └── deliveries/
    └── health/
        ├── health.module.ts
        └── checks/
```

### 3.2 Authentification — Better-Auth

- **Fastify** comme adaptateur HTTP : `@nestjs/platform-fastify` + `FastifyAdapter`
- `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())`
- Les routes Better-Auth passent par middleware Fastify — `@fastify/cors` ne les couvre pas automatiquement, la lib gère ça via `trustedOrigins`
- Les types `Request` sont `FastifyRequest` (pas `ExpressRequest`)
- `AuthModule.forRoot({ auth })` dans `app.module.ts`
- Guard global actif par défaut — toutes les routes sont protégées
- Routes publiques exposées via `@AllowAnonymous()` (fourni par la lib)
- Auth core : email/password + OAuth (Google, GitHub) + vérification email + reset password
- Exemples commentés pour activer : 2FA, magic link, sessions multiples

### 3.3 RBAC

- Via le plugin `admin` de Better-Auth avec `createAccessControl`
- Permissions par ressource définies dans `auth.ts` : `users:read`, `users:write`, `files:upload`, `settings:manage`, etc.
- Décorateurs fournis par la lib : `@UserHasPermission()`, `@Roles()`
- Rôles système par défaut : `admin`, `member`, `viewer`
- Commentaire dans le code pour évoluer vers des rôles par contexte (organization plugin)

### 3.4 Audit Logs

- `AuditLogInterceptor` intercepte automatiquement les mutations (POST/PATCH/DELETE)
- Enregistre : action, utilisateur, ressource, timestamp, IP
- Endpoint API `GET /accounts/audit-logs` avec filtres (user, action, date range)
- Schéma DB dans `@repo/db/schema/audit-logs.ts`

### 3.5 API & Documentation

- Versioning : `/api/v1`
- Swagger auto-généré via `@nestjs/swagger` + `@anatine/zod-nestjs`
- Spec OpenAPI exportée en JSON → génération du client TypeScript frontend
- `ZodValidationPipe` global — DTOs inférés depuis `@repo/validators`

### 3.6 Stockage Fichiers

- Driver S3 via `@aws-sdk/client-s3` — compatible MinIO et AWS S3 sans changement de code
- MinIO en `docker-compose.yml` pour le dev local (port `9000` API, port `9001` console)
- Config (`endpoint`, `bucket`, `credentials`) dans `env.ts` via Zod

---

## 4. Frontend (Next.js)

### 4.1 Structure

```
apps/frontend/src/
├── app/
│   ├── layout.tsx                 # Root layout (providers, fonts, next-themes)
│   ├── auth/                      # Pages publiques (/auth/login, /auth/register...)
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── (dashboard)/               # Route group — pages protégées (pas de préfixe URL)
│       ├── layout.tsx             # Shell : sidebar + header + breadcrumbs
│       ├── page.tsx               # Home dashboard
│       ├── account/
│       │   ├── users/
│       │   ├── roles/
│       │   └── audit-logs/
│       ├── notifications/
│       ├── files/
│       ├── settings/
│       └── webhooks/
├── components/
│   ├── ui/                        # Re-exports depuis @repo/ui (Shadcn)
│   └── shared/                    # Composants métier partagés
├── lib/
│   ├── auth-client.ts             # Instance Better-Auth côté client
│   ├── api-client.ts              # Client TypeScript généré depuis OpenAPI
│   └── utils.ts
└── hooks/
    └── use-permissions.ts         # Hook RBAC côté client
```

### 4.2 Points clés

- **Middleware Next.js** protège le route group `(dashboard)` — redirect vers `/auth/login` si non authentifié
- **Formulaires** — `react-hook-form` + schémas Zod depuis `@repo/validators`
- **`use-permissions`** — expose les permissions de l'utilisateur connecté pour afficher/masquer des éléments UI
- **Thème** — clair/sombre via `next-themes` + variables CSS Shadcn

---

## 5. Site & Documentation (Next.js + Fumadocs)

### 5.1 Structure

```
apps/web/src/
├── app/
│   ├── layout.tsx                 # Root layout (nav, footer)
│   ├── page.tsx                   # Landing page
│   ├── pricing/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── blog/
│   │   ├── page.tsx               # Liste des articles
│   │   └── [slug]/
│   │       └── page.tsx
│   └── docs/                      # Documentation Fumadocs
│       ├── layout.tsx             # Layout Fumadocs (sidebar, search)
│       └── [[...slug]]/
│           └── page.tsx
├── components/
│   ├── ui/                        # Re-exports @repo/ui
│   └── marketing/                 # Hero, Pricing, Features...
├── content/
│   ├── docs/
│   │   ├── getting-started/
│   │   ├── backend/
│   │   └── frontend/
│   └── blog/
│       └── 2026-01-01-hello-world.mdx
└── lib/
    └── source.ts                  # Config Fumadocs (sources: docs + blog)
```

### 5.2 Points clés

- Fumadocs gère uniquement `/docs` — le reste est du Next.js classique
- Blog et documentation partagent le même pipeline MDX via `source.ts`
- `@repo/ui` partagé entre site marketing et documentation

---

## 6. Packages Partagés

### `@repo/validators`
Schémas Zod organisés par domaine. Source de vérité unique pour la validation backend (pipes NestJS) et frontend (formulaires react-hook-form).

```
packages/validators/src/
├── auth.ts          # login, register, reset-password
├── accounts.ts      # users, roles
├── files.ts
├── notifications.ts
├── settings.ts
└── webhooks.ts
```

### `@repo/db`
Client Drizzle + schémas de tables + migrations. Importé uniquement par le backend.

```
packages/db/src/
├── index.ts         # Export client Drizzle (PostgreSQL)
├── schema/
│   ├── auth.ts      # Tables Better-Auth
│   ├── accounts.ts
│   ├── files.ts
│   ├── notifications.ts
│   ├── settings.ts
│   ├── audit-logs.ts
│   └── webhooks.ts
└── migrations/
```

**Base de données :** PostgreSQL en dev et en production. Docker Compose fournit une instance PostgreSQL locale prête à l'emploi — pas besoin d'installer PostgreSQL sur la machine.

### `@repo/ui`
Composants Shadcn/ui préconfigurés + hooks UI (`use-toast`, `use-mobile`) + helper `cn()`. Importé par frontend et web.

---

## 7. DevOps & Qualité

### Docker Compose (dev)
- **PostgreSQL** — port `5432`
- **MinIO** — port `9000` (API S3), port `9001` (console web)
- **Redis** — port `6379` (sessions Better-Auth, cache)

### CI GitHub Actions
- `ci.yml` — déclenché sur chaque PR : lint, typecheck, tests unitaires, tests e2e, build
- `release.yml` — build de vérification sur `main`
- Tests e2e utilisent `docker-compose.test.yml` avec une PostgreSQL isolée

### Qualité locale
- **Husky** — pre-commit hooks
- **lint-staged** — ESLint + Prettier sur les fichiers modifiés uniquement
- **commitlint** — enforce conventional commits (`feat:`, `fix:`, `chore:`...)
- **Zod env validation** — l'app ne démarre pas si une variable d'environnement est manquante ou invalide

---

## 8. Variables d'Environnement

Un `.env.example` documenté à la racine. Chaque app valide ses variables via un schéma Zod au démarrage.

```
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# S3 / MinIO
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=uploads
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Redis
REDIS_URL=redis://localhost:6379
```

---

## 9. Tests Frontend (Playwright)

```
apps/frontend/
└── e2e/
    ├── auth/
    │   ├── login.spec.ts
    │   ├── register.spec.ts
    │   └── reset-password.spec.ts
    ├── dashboard/
    │   ├── account/
    │   │   ├── users.spec.ts
    │   │   └── audit-logs.spec.ts
    │   ├── files.spec.ts
    │   └── settings.spec.ts
    └── playwright.config.ts
```

**Points clés :**
- Playwright configuré pour tester contre le frontend en dev (`http://localhost:3001`)
- Base de données de test isolée via `docker-compose.test.yml`
- Tests e2e couvrent les flows critiques : authentification, RBAC, upload fichiers
- Intégré dans le CI (`ci.yml`) — lancé après le build frontend

---

## 10. Ce qui est hors scope

- Déploiement (Railway, Vercel, Render) — un README dédié suffira
- Changesets / versioning des packages
- Internationalisation (i18n)
- Multi-tenant actif (l'architecture est préparée, pas implémentée)
