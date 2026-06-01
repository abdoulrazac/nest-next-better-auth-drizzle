# Enterprise Boilerplate

Production-ready fullstack monorepo starter. NestJS + Fastify + Drizzle + Better-Auth on the backend. Next.js + Shadcn/ui + Zod on the frontend. Marketing site with Fumadocs documentation included.

---

## Stack

| Layer        | Technology                                               |
| ------------ | -------------------------------------------------------- |
| Backend      | NestJS (Fastify adapter), Drizzle ORM, Better-Auth       |
| Frontend     | Next.js 16 (App Router), Shadcn/ui, react-hook-form, Zod |
| Site / Docs  | Next.js 16, Fumadocs                                     |
| Database     | PostgreSQL (Drizzle), Redis                              |
| File storage | S3-compatible (MinIO in dev)                             |
| Monorepo     | Turborepo + Bun workspaces                               |
| Auth         | Better-Auth with RBAC (roles + per-resource permissions) |

---

## Apps & Packages

```
apps/
  backend/     NestJS API — port 3000
  frontend/    Dashboard — port 3002
  web/         Marketing site + docs — port 3003
packages/
  ui/          Shadcn/ui components (shared)
  validators/  Zod schemas (shared between backend and frontend)
  db/          Drizzle schema, migrations, client (backend only)
  typescript-config/
  eslint-config/
```

---

## Features

- **Auth & RBAC** — Better-Auth with admin plugin, roles, per-resource permissions (`users:read`, `files:upload`, …)
- **Accounts module** — Users CRUD, ban/unban, roles CRUD, role assignment
- **Audit logs** — Every mutation intercepted and logged automatically
- **File storage** — Presigned S3 URL flow (upload directly to MinIO/S3, confirm with backend)
- **Notifications** — In-app notifications with unread count and bulk mark-read
- **Settings** — App-level key/value settings + user preferences
- **Webhooks** — CRUD + HTTP delivery with history
- **Health check** — `GET /health` via `@nestjs/terminus`
- **OpenAPI** — Auto-generated Swagger docs at `/api/docs`
- **Dashboard** — Sidebar + header, auth pages, protected routes via `proxy.ts`
- **Marketing site** — Landing, pricing, about, blog (MDX), `/docs` (Fumadocs)
- **Shared validators** — Single Zod source of truth for both backend pipes and frontend forms

---

## Prerequisites

- [Bun](https://bun.sh) >= 1.1
- [Docker](https://docker.com) (for PostgreSQL, Redis, MinIO)

---

## Getting started

```bash
# 1. Clone
git clone https://github.com/your-org/enterprise-boilerplate
cd enterprise-boilerplate

# 2. Install dependencies
bun install

# 3. Start infrastructure (PostgreSQL, Redis, MinIO)
docker compose up -d

# 4. Copy env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local   # optional

# 5. Run migrations
cd packages/db && bun run db:migrate && cd ../..

# 6. Start all apps
bun run dev
```

| App            | URL                            |
| -------------- | ------------------------------ |
| Backend API    | http://localhost:3000          |
| Swagger docs   | http://localhost:3000/api/docs |
| Dashboard      | http://localhost:3002          |
| Marketing site | http://localhost:3003          |

---

## Environment variables

### `apps/backend/.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/enterprise
REDIS_URL=redis://localhost:6379
BETTER_AUTH_SECRET=change-me-in-production
AWS_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_BUCKET=uploads
AWS_REGION=us-east-1
PORT=3000
```

### `apps/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Development commands

```bash
bun run dev          # Start all apps in parallel
bun run build        # Build all apps
bun run lint         # Lint all packages
bun run typecheck    # Typecheck all packages
```

### Backend only

```bash
cd apps/backend
bun run start:dev    # Watch mode
```

### Database

```bash
cd packages/db
bun run db:generate  # Generate migrations from schema changes
bun run db:migrate   # Apply migrations
bun run db:studio    # Open Drizzle Studio
```

---

## Auth & RBAC

Routes are protected by default via a global Better-Auth guard.

```typescript
// Public route
@AllowAnonymous()
@Get('health')
check() { ... }

// Permission-gated route
@UserHasPermission({ permission: { users: ['read'] } })
@Get('users')
listUsers() { ... }
```

RBAC is defined in `apps/backend/src/auth/auth.ts` using `createAccessControl` from `better-auth/plugins/access`.

---

## File upload flow

1. Frontend calls `POST /files/presigned-url` → receives a presigned S3 URL
2. Frontend uploads the file directly to MinIO/S3
3. Frontend calls `POST /files/confirm` with the key → backend records the file in DB

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push:

- Lint
- Typecheck
- Backend tests
- Build

---

## Project structure

```
apps/backend/src/
├── auth/                 Better-Auth config, guard, decorators
├── config/               Env validation (Zod)
├── common/               Interceptors, pipes, decorators
└── modules/
    ├── accounts/         Users, roles, audit-logs
    ├── files/            S3 upload flow
    ├── notifications/
    ├── settings/
    ├── webhooks/
    └── health/

apps/frontend/src/
├── app/
│   ├── auth/             Login, register, forgot-password
│   └── (dashboard)/      Protected pages
├── components/           Sidebar, Header, ThemeProvider
└── lib/
    └── auth-client.ts    Better-Auth client

apps/web/src/
├── app/
│   ├── page.tsx          Landing
│   ├── pricing/
│   ├── about/
│   ├── blog/             MDX blog
│   └── docs/             Fumadocs
└── components/           Nav, Footer
```

---

## License

MIT
