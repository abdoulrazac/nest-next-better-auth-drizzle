# Plan 6 — OpenAPI TypeScript Client

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a fully typed TypeScript API client from the NestJS backend's OpenAPI spec and expose it as `@repo/api-client` for the frontend to consume instead of raw fetch calls.

**Architecture:** A new `packages/api-client/` workspace package runs `@hey-api/openapi-ts` against a static `openapi.json` snapshot (exported from the running backend) and writes generated types + SDK into `src/generated/`. The package re-exports a pre-configured fetch client from `src/index.ts` so the frontend only imports from `@repo/api-client`. A `generate` turbo task runs the codegen as a pre-build step, consuming the static JSON so no live backend is needed at build time.

**Tech Stack:** `@hey-api/openapi-ts` (codegen), `@hey-api/client-fetch` (runtime HTTP client), NestJS Swagger / `@nestjs/swagger` (spec source), pnpm workspaces, Turborepo.

---

## Fichiers créés ou modifiés

| Path                                       | Action                                          |
| ------------------------------------------ | ----------------------------------------------- |
| `packages/api-client/package.json`         | create                                          |
| `packages/api-client/tsconfig.json`        | create                                          |
| `packages/api-client/openapi-ts.config.ts` | create                                          |
| `packages/api-client/src/index.ts`         | create                                          |
| `packages/api-client/src/generated/`       | generated (do not edit manually)                |
| `apps/backend/src/main.ts`                 | modify — add `writeFileSync` spec export script |
| `apps/backend/scripts/export-spec.ts`      | create                                          |
| `apps/frontend/package.json`               | modify — add `@repo/api-client` dependency      |
| `apps/frontend/src/lib/api.ts`             | create — re-export configured client            |
| `apps/frontend/src/app/api-test/page.tsx`  | create — smoke-test page                        |
| `turbo.json`                               | modify — add `generate` task                    |
| `package.json` (root)                      | modify — add root-level `generate` script       |

---

## Task 1: Export static OpenAPI JSON from the backend

Create a standalone script that boots the NestJS app just enough to produce `openapi.json`, then exits. This JSON is the source of truth for codegen.

- [ ] Create `apps/backend/scripts/export-spec.ts`:

```typescript
// apps/backend/scripts/export-spec.ts
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { AppModule } from "../src/app.module";

async function exportSpec() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: false },
  );

  app.enableVersioning({
    type: (await import("@nestjs/common")).VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle("Enterprise API")
    .setDescription("Enterprise boilerplate API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputPath = resolve(
    __dirname,
    "../../../packages/api-client/openapi.json",
  );
  writeFileSync(outputPath, JSON.stringify(document, null, 2), "utf-8");
  console.log(`OpenAPI spec written to ${outputPath}`);

  await app.close();
  process.exit(0);
}

exportSpec().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] Add `export-spec` script to `apps/backend/package.json` in the `"scripts"` block:

```json
"export-spec": "ts-node -r tsconfig-paths/register scripts/export-spec.ts"
```

- [ ] Create the destination directory and placeholder so the path resolves before first run:

```bash
mkdir -p packages/api-client
touch packages/api-client/openapi.json
```

- [ ] Verify the script runs (requires `.env` with `DATABASE_URL` etc.):

```bash
pnpm --filter backend export-spec
```

Expected: `packages/api-client/openapi.json` is written with valid OpenAPI 3.x JSON.

- [ ] Commit:

```bash
git add apps/backend/scripts/export-spec.ts apps/backend/package.json packages/api-client/openapi.json
git commit -m "feat(backend): add export-spec script to write openapi.json"
```

---

## Task 2: Create the `packages/api-client` workspace package

Scaffold the package with its `package.json`, `tsconfig.json`, and codegen config.

- [ ] Create `packages/api-client/package.json`:

```json
{
  "name": "@repo/api-client",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "generate": "openapi-ts",
    "check-types": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0"
  },
  "dependencies": {
    "@hey-api/client-fetch": "0.9.0"
  },
  "devDependencies": {
    "@hey-api/openapi-ts": "0.66.3",
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "eslint": "^9.18.0",
    "typescript": "^5.7.3"
  }
}
```

> **Note:** Pin exact versions (`0.66.3` / `0.9.0`) as recommended by hey-api. Check latest on npm before running and update if needed: `npm info @hey-api/openapi-ts version` and `npm info @hey-api/client-fetch version`.

- [ ] Create `packages/api-client/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "moduleResolution": "Bundler",
    "module": "ESNext"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/generated"]
}
```

- [ ] Create `packages/api-client/openapi-ts.config.ts`:

```typescript
import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi.json",
  output: {
    path: "./src/generated",
    format: "prettier",
    lint: false,
  },
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "@hey-api/client-fetch",
      runtimeConfigKey: "client",
    },
  ],
});
```

- [ ] Create `packages/api-client/src/index.ts`:

```typescript
// packages/api-client/src/index.ts
// Re-export everything from generated code
export * from "./generated/index.js";

// Export a pre-configured client factory
export { createClient, createConfig } from "@hey-api/client-fetch";
import { createClient, createConfig } from "@hey-api/client-fetch";

/**
 * Default API client configured for the backend base URL.
 * Override `NEXT_PUBLIC_API_URL` in the frontend .env to point to the backend.
 */
export const apiClient = createClient(
  createConfig({
    baseUrl:
      typeof process !== "undefined"
        ? (process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3000")
        : "http://localhost:3000",
  }),
);
```

- [ ] Install dependencies from the repo root:

```bash
pnpm install
```

- [ ] Commit:

```bash
git add packages/api-client/package.json packages/api-client/tsconfig.json packages/api-client/openapi-ts.config.ts packages/api-client/src/index.ts
git commit -m "feat(api-client): scaffold @repo/api-client package with hey-api config"
```

---

## Task 3: Run code generation and verify output

- [ ] Run the generator from the repo root (requires `openapi.json` to exist from Task 1):

```bash
pnpm --filter @repo/api-client generate
```

- [ ] Verify that `packages/api-client/src/generated/` now contains these files:
  - `types.gen.ts` — TypeScript interfaces for all request/response bodies
  - `sdk.gen.ts` — typed functions for every API endpoint
  - `index.ts` — barrel export
  - `client/` or `core/` — internal fetch machinery (do not import directly)

- [ ] Run type-check on the package to confirm generated code compiles:

```bash
pnpm --filter @repo/api-client check-types
```

Expected: no TypeScript errors.

- [ ] Add `packages/api-client/src/generated/` to `.gitignore` (generated code should not be committed; it is regenerated at build time):

```bash
# append to root .gitignore
echo "\n# Generated API client\npackages/api-client/src/generated/" >> .gitignore
```

- [ ] Commit:

```bash
git add packages/api-client/src/generated/.gitkeep .gitignore
git commit -m "feat(api-client): run initial codegen; ignore generated output in git"
```

---

## Task 4: Wire the `generate` task into Turborepo

Make codegen a first-class pipeline step so `turbo build` regenerates the client before building dependents.

- [ ] Edit `turbo.json` — add a `generate` task entry inside `"tasks"`:

```json
"generate": {
  "dependsOn": [],
  "inputs": ["openapi.json", "openapi-ts.config.ts"],
  "outputs": ["src/generated/**"],
  "cache": true
}
```

Full updated `turbo.json`:

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
    "generate": {
      "dependsOn": [],
      "inputs": ["openapi.json", "openapi-ts.config.ts"],
      "outputs": ["src/generated/**"],
      "cache": true
    },
    "lint": {
      "dependsOn": ["^lint"],
      "env": ["DATABASE_URL"]
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

- [ ] Add a root-level convenience script to `package.json` (root). First read root `package.json`, then add:

```json
"generate": "turbo generate"
```

- [ ] Verify turbo runs generate:

```bash
pnpm generate
```

Expected: turbo runs `@repo/api-client#generate`, cache-hits or regenerates `src/generated/`.

- [ ] Commit:

```bash
git add turbo.json package.json
git commit -m "feat(turbo): add generate pipeline task for api-client codegen"
```

---

## Task 5: Consume the client in the frontend

Add `@repo/api-client` to the frontend, create a shared API helper, and add a smoke-test page.

- [ ] Edit `apps/frontend/package.json` — add to `"dependencies"`:

```json
"@repo/api-client": "workspace:*"
```

- [ ] Run install:

```bash
pnpm install
```

- [ ] Create `apps/frontend/src/lib/api.ts`:

```typescript
// apps/frontend/src/lib/api.ts
// Single import point for the typed API client.
// Components should import from here, not directly from @repo/api-client,
// so base URL configuration is centralised.

export { apiClient } from "@repo/api-client";
export * from "@repo/api-client";
```

- [ ] Create `apps/frontend/src/app/api-test/page.tsx` as a Server Component smoke test:

```typescript
// apps/frontend/src/app/api-test/page.tsx
// Smoke-test page: verifies @repo/api-client types are importable.
// Remove or gate behind an env flag before going to production.

import { apiClient } from '@/lib/api';

export default async function ApiTestPage() {
  // Example: fetch health endpoint — adjust to a real endpoint from sdk.gen.ts
  // This demonstrates the typed client is wired correctly.
  // Replace `getHealth` with an actual exported SDK function once generated.
  let status = 'untested';

  try {
    const response = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000'}/api/v1/health`,
      { cache: 'no-store' },
    );
    status = response.ok ? 'ok' : `error ${response.status}`;
  } catch {
    status = 'unreachable';
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>API Client Smoke Test</h1>
      <p>Backend health: <strong>{status}</strong></p>
      <p>
        API client base URL:{' '}
        <code>{process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000'}</code>
      </p>
      <p>
        <code>apiClient</code> is configured:{' '}
        <strong>{apiClient ? 'yes' : 'no'}</strong>
      </p>
    </main>
  );
}
```

- [ ] Add `NEXT_PUBLIC_API_URL` to `apps/frontend/.env.local` (create if absent):

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" >> apps/frontend/.env.local
```

- [ ] Type-check the frontend to confirm no import errors:

```bash
pnpm --filter frontend check-types
```

Expected: no errors related to `@repo/api-client`.

- [ ] Commit:

```bash
git add apps/frontend/package.json apps/frontend/src/lib/api.ts apps/frontend/src/app/api-test/page.tsx apps/frontend/.env.local
git commit -m "feat(frontend): wire @repo/api-client; add api-test smoke page"
```

---

## Task 6: End-to-end verification

Confirm the full workflow: export spec → generate → build → run → smoke test passes.

- [ ] Export fresh spec (backend must be reachable with valid env):

```bash
pnpm --filter backend export-spec
```

- [ ] Regenerate client:

```bash
pnpm generate
```

- [ ] Build all packages:

```bash
pnpm build
```

Expected: no errors.

- [ ] Start backend and frontend in dev mode (two terminals):

```bash
# terminal 1
pnpm --filter backend start:dev

# terminal 2
pnpm --filter frontend dev
```

- [ ] Visit `http://localhost:3001/api-test` in a browser.

Expected: page renders with `Backend health: ok` and `apiClient is configured: yes`.

- [ ] Commit:

```bash
git add .
git commit -m "chore: verify openapi client generation end-to-end"
```

---

## Maintenance notes

- **Regenerating after backend changes:** run `pnpm --filter backend export-spec && pnpm generate`. This should be added to developer onboarding docs.
- **CI:** add `export-spec` + `generate` as pre-build steps in CI, or commit `openapi.json` (not `src/generated/`) to the repo so CI can run `pnpm generate` without a live backend.
- **Auth headers:** the `apiClient` in `src/index.ts` does not attach Bearer tokens. Wrap calls with a middleware or pass `headers` per-request: `apiClient.GET('/api/v1/...', { headers: { Authorization: \`Bearer ${token}\` } })`.
- **Versioning:** `@hey-api/openapi-ts` is in initial development — pin exact versions and read migration notes before upgrading.
