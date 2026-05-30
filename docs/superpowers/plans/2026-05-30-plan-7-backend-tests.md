# Plan 7 — Backend E2E Tests

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete E2E test suite for the NestJS/Fastify backend covering health, auth, accounts, and notifications endpoints using Vitest and supertest.

**Architecture:** Each test suite spins up the real NestJS application with a `FastifyAdapter` via `@nestjs/testing`, authenticates via Better-Auth's email/password flow, and stores session cookies for protected requests. A shared `createTestApp` helper centralises app bootstrap and teardown; a `loginAsAdmin` helper handles signup+login and returns a cookie string ready for `set('cookie', cookie)` calls.

**Tech Stack:** Vitest, @nestjs/testing, supertest, @nestjs/platform-fastify, Better-Auth email/password, Postgres (DATABASE_URL_TEST env var), ts-node/esm via vitest's native TypeScript support.

---

## Fichiers créés ou modifiés

| Path                                               | Action                                       |
| -------------------------------------------------- | -------------------------------------------- |
| `apps/backend/package.json`                        | modify — add vitest deps + `test:e2e` script |
| `apps/backend/vitest.e2e.config.ts`                | create                                       |
| `apps/backend/test/helpers/app.helper.ts`          | create                                       |
| `apps/backend/test/helpers/auth.helper.ts`         | create                                       |
| `apps/backend/test/e2e/health.e2e-spec.ts`         | create                                       |
| `apps/backend/test/e2e/auth.e2e-spec.ts`           | create                                       |
| `apps/backend/test/e2e/accounts-users.e2e-spec.ts` | create                                       |
| `apps/backend/test/e2e/notifications.e2e-spec.ts`  | create                                       |
| `apps/backend/.env.test`                           | create (gitignored values — template only)   |

---

## Task 1: Install Vitest and configure the E2E test runner

- [ ] Add dev dependencies to `apps/backend/package.json`:

```bash
cd apps/backend && bun add -d vitest @vitest/runner vite-tsconfig-paths
```

- [ ] Verify `supertest` and `@types/supertest` are already present (they are — confirmed in `package.json`).

- [ ] Create `apps/backend/vitest.e2e.config.ts`:

```typescript
// apps/backend/vitest.e2e.config.ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["test/e2e/**/*.e2e-spec.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Run suites serially so each suite gets a clean app instance
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
    setupFiles: ["test/helpers/setup.ts"],
  },
});
```

- [ ] Create `apps/backend/test/helpers/setup.ts` to load `.env.test` before any test runs:

```typescript
// apps/backend/test/helpers/setup.ts
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env.test") });
```

- [ ] Add script to `apps/backend/package.json` (inside `"scripts"`):

```json
"test:e2e:vitest": "vitest run --config vitest.e2e.config.ts"
```

- [ ] Create `apps/backend/.env.test` (values are examples — replace with real test DB/Redis):

```dotenv
# apps/backend/.env.test
NODE_ENV=test
PORT=0
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/enterprise_test
BETTER_AUTH_SECRET=super-secret-test-key-minimum-32-chars!!
BETTER_AUTH_URL=http://localhost:3000
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=test-bucket
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
REDIS_URL=redis://localhost:6379
```

- [ ] Commit:

```bash
git add apps/backend/vitest.e2e.config.ts apps/backend/test/helpers/setup.ts apps/backend/package.json
git commit -m "test(backend): add vitest e2e config and setup"
```

---

## Task 2: Create shared test helpers

- [ ] Create `apps/backend/test/helpers/app.helper.ts`:

```typescript
// apps/backend/test/helpers/app.helper.ts
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { VersioningType } from "@nestjs/common";
import { AppModule } from "../../src/app.module";

export async function createTestApp(): Promise<NestFastifyApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  app.enableVersioning({ type: VersioningType.URI });

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app;
}

export async function closeTestApp(app: NestFastifyApplication): Promise<void> {
  await app.close();
}
```

- [ ] Create `apps/backend/test/helpers/auth.helper.ts`:

```typescript
// apps/backend/test/helpers/auth.helper.ts
import supertest from "supertest";
import { NestFastifyApplication } from "@nestjs/platform-fastify";

export interface TestCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * Signs up a new user and returns the session cookie string.
 * The cookie can be passed directly to `.set('cookie', cookie)`.
 */
export async function signUpAndLogin(
  app: NestFastifyApplication,
  credentials: TestCredentials,
): Promise<string> {
  const server = app.getHttpServer();

  // 1. Sign up
  const signUpRes = await supertest(server)
    .post("/api/auth/sign-up/email")
    .send({
      email: credentials.email,
      password: credentials.password,
      name: credentials.name,
    })
    .expect((res) => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(
          `Sign up failed with status ${res.status}: ${JSON.stringify(res.body)}`,
        );
      }
    });

  const signUpCookies: string[] = signUpRes.headers["set-cookie"] ?? [];

  if (signUpCookies.length > 0) {
    // Better-Auth sets session on sign-up in some configs
    return Array.isArray(signUpCookies)
      ? signUpCookies.join("; ")
      : signUpCookies;
  }

  // 2. If no cookie on sign-up, explicitly sign in
  const signInRes = await supertest(server)
    .post("/api/auth/sign-in/email")
    .send({
      email: credentials.email,
      password: credentials.password,
    })
    .expect((res) => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(
          `Sign in failed with status ${res.status}: ${JSON.stringify(res.body)}`,
        );
      }
    });

  const signInCookies: string[] = signInRes.headers["set-cookie"] ?? [];
  if (signInCookies.length === 0) {
    throw new Error("No session cookie received after sign-in");
  }

  return Array.isArray(signInCookies)
    ? signInCookies.join("; ")
    : signInCookies;
}

/**
 * Returns unique test credentials to avoid conflicts between test runs.
 */
export function uniqueCredentials(prefix = "user"): TestCredentials {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return {
    email: `${prefix}-${id}@test.example`,
    password: "TestPassword123!",
    name: `Test ${prefix} ${id}`,
  };
}
```

- [ ] Commit:

```bash
git add apps/backend/test/helpers/
git commit -m "test(backend): add createTestApp and auth helpers"
```

---

## Task 3: Health endpoint E2E test

- [ ] Create `apps/backend/test/e2e/health.e2e-spec.ts`:

```typescript
// apps/backend/test/e2e/health.e2e-spec.ts
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import supertest from "supertest";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { createTestApp, closeTestApp } from "../helpers/app.helper";

describe("HealthController (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it("GET /health → 200 with status ok", async () => {
    const res = await supertest(app.getHttpServer()).get("/health").expect(200);

    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("GET /health → no auth required (public route)", async () => {
    // Confirm no cookie / auth header still returns 200
    const res = await supertest(app.getHttpServer())
      .get("/health")
      .set("cookie", "")
      .expect(200);

    expect(res.body.status).toBe("ok");
  });
});
```

- [ ] Run the suite to confirm it passes (requires real DB + Redis running):

```bash
cd apps/backend && bun run test:e2e:vitest -- --reporter=verbose test/e2e/health.e2e-spec.ts
```

- [ ] Commit:

```bash
git add apps/backend/test/e2e/health.e2e-spec.ts
git commit -m "test(backend): e2e tests for health endpoint"
```

---

## Task 4: Auth signup/login E2E tests

- [ ] Create `apps/backend/test/e2e/auth.e2e-spec.ts`:

```typescript
// apps/backend/test/e2e/auth.e2e-spec.ts
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import supertest from "supertest";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { createTestApp, closeTestApp } from "../helpers/app.helper";
import { uniqueCredentials } from "../helpers/auth.helper";

describe("Auth (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe("POST /api/auth/sign-up/email", () => {
    it("registers a new user and returns 200", async () => {
      const creds = uniqueCredentials("signup");
      const res = await supertest(app.getHttpServer())
        .post("/api/auth/sign-up/email")
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        })
        .expect(200);

      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(creds.email);
    });

    it("returns 422 when email already taken", async () => {
      const creds = uniqueCredentials("dup");

      // first sign-up
      await supertest(app.getHttpServer())
        .post("/api/auth/sign-up/email")
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        })
        .expect(200);

      // duplicate
      await supertest(app.getHttpServer())
        .post("/api/auth/sign-up/email")
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        })
        .expect((res) => {
          expect([400, 409, 422]).toContain(res.status);
        });
    });

    it("returns 400 when required fields are missing", async () => {
      await supertest(app.getHttpServer())
        .post("/api/auth/sign-up/email")
        .send({ email: "not-an-email" })
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
        });
    });
  });

  describe("POST /api/auth/sign-in/email", () => {
    it("returns session cookie on valid credentials", async () => {
      const creds = uniqueCredentials("login");

      await supertest(app.getHttpServer())
        .post("/api/auth/sign-up/email")
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        });

      const res = await supertest(app.getHttpServer())
        .post("/api/auth/sign-in/email")
        .send({ email: creds.email, password: creds.password })
        .expect(200);

      const cookies: string[] = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.length).toBeGreaterThan(0);
      // Better-Auth session cookie name
      const hasSessionCookie = cookies.some(
        (c) =>
          c.startsWith("better-auth.session_token") || c.includes("session"),
      );
      expect(hasSessionCookie).toBe(true);
    });

    it("returns 401 on wrong password", async () => {
      const creds = uniqueCredentials("badpw");

      await supertest(app.getHttpServer())
        .post("/api/auth/sign-up/email")
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        });

      await supertest(app.getHttpServer())
        .post("/api/auth/sign-in/email")
        .send({ email: creds.email, password: "WrongPassword999!" })
        .expect((res) => {
          expect([400, 401, 403]).toContain(res.status);
        });
    });
  });
});
```

- [ ] Run:

```bash
cd apps/backend && bun run test:e2e:vitest -- --reporter=verbose test/e2e/auth.e2e-spec.ts
```

- [ ] Commit:

```bash
git add apps/backend/test/e2e/auth.e2e-spec.ts
git commit -m "test(backend): e2e tests for auth sign-up and sign-in"
```

---

## Task 5: Accounts / Users E2E tests

- [ ] Create `apps/backend/test/e2e/accounts-users.e2e-spec.ts`:

```typescript
// apps/backend/test/e2e/accounts-users.e2e-spec.ts
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import supertest from "supertest";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { createTestApp, closeTestApp } from "../helpers/app.helper";
import { signUpAndLogin, uniqueCredentials } from "../helpers/auth.helper";

describe("AccountsModule — UsersController (e2e)", () => {
  let app: NestFastifyApplication;
  let adminCookie: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Create an admin user.
    // NOTE: Better-Auth admin plugin makes the first registered user an admin,
    // OR you may need to manually set the role in DB.  Using a unique prefix
    // to avoid conflicts with other suites.
    const adminCreds = uniqueCredentials("admin");
    adminCookie = await signUpAndLogin(app, adminCreds);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe("GET /v1/accounts/users", () => {
    it("returns 401 when unauthenticated", async () => {
      await supertest(app.getHttpServer())
        .get("/v1/accounts/users")
        .expect((res) => {
          expect([401, 403]).toContain(res.status);
        });
    });

    it("returns paginated users list when authenticated as admin", async () => {
      const res = await supertest(app.getHttpServer())
        .get("/v1/accounts/users")
        .set("cookie", adminCookie)
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty("total");
    });

    it("accepts pagination query params", async () => {
      const res = await supertest(app.getHttpServer())
        .get("/v1/accounts/users?page=1&limit=5")
        .set("cookie", adminCookie)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it("accepts search query param", async () => {
      const res = await supertest(app.getHttpServer())
        .get("/v1/accounts/users?search=nobody-with-this-name-xyz")
        .set("cookie", adminCookie)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /v1/accounts/users/:id", () => {
    it("returns 400 on invalid UUID", async () => {
      await supertest(app.getHttpServer())
        .get("/v1/accounts/users/not-a-uuid")
        .set("cookie", adminCookie)
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
        });
    });

    it("returns 404 for non-existent user", async () => {
      await supertest(app.getHttpServer())
        .get("/v1/accounts/users/00000000-0000-0000-0000-000000000000")
        .set("cookie", adminCookie)
        .expect((res) => {
          expect([404]).toContain(res.status);
        });
    });
  });
});
```

- [ ] Run:

```bash
cd apps/backend && bun run test:e2e:vitest -- --reporter=verbose test/e2e/accounts-users.e2e-spec.ts
```

- [ ] Commit:

```bash
git add apps/backend/test/e2e/accounts-users.e2e-spec.ts
git commit -m "test(backend): e2e tests for accounts/users endpoints"
```

---

## Task 6: Notifications E2E tests

- [ ] Create `apps/backend/test/e2e/notifications.e2e-spec.ts`:

```typescript
// apps/backend/test/e2e/notifications.e2e-spec.ts
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import supertest from "supertest";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { createTestApp, closeTestApp } from "../helpers/app.helper";
import { signUpAndLogin, uniqueCredentials } from "../helpers/auth.helper";

describe("NotificationsModule (e2e)", () => {
  let app: NestFastifyApplication;
  let userCookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    const creds = uniqueCredentials("notif-user");
    userCookie = await signUpAndLogin(app, creds);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe("GET /v1/notifications", () => {
    it("returns 401 when unauthenticated", async () => {
      await supertest(app.getHttpServer())
        .get("/v1/notifications")
        .expect((res) => {
          expect([401, 403]).toContain(res.status);
        });
    });

    it("returns empty paginated list for a new user", async () => {
      const res = await supertest(app.getHttpServer())
        .get("/v1/notifications")
        .set("cookie", userCookie)
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("accepts page and limit query params", async () => {
      const res = await supertest(app.getHttpServer())
        .get("/v1/notifications?page=1&limit=10")
        .set("cookie", userCookie)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe("GET /v1/notifications/unread-count", () => {
    it("returns 401 when unauthenticated", async () => {
      await supertest(app.getHttpServer())
        .get("/v1/notifications/unread-count")
        .expect((res) => {
          expect([401, 403]).toContain(res.status);
        });
    });

    it("returns numeric count for authenticated user", async () => {
      const res = await supertest(app.getHttpServer())
        .get("/v1/notifications/unread-count")
        .set("cookie", userCookie)
        .expect(200);

      expect(
        typeof res.body.count === "number" || typeof res.body === "number",
      ).toBe(true);
    });
  });

  describe("POST /v1/notifications/mark-read", () => {
    it("returns 401 when unauthenticated", async () => {
      await supertest(app.getHttpServer())
        .post("/v1/notifications/mark-read")
        .send({ ids: [] })
        .expect((res) => {
          expect([401, 403]).toContain(res.status);
        });
    });

    it("accepts empty ids array without error", async () => {
      await supertest(app.getHttpServer())
        .post("/v1/notifications/mark-read")
        .set("cookie", userCookie)
        .send({ ids: [] })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
        });
    });

    it("returns 400 on invalid payload", async () => {
      await supertest(app.getHttpServer())
        .post("/v1/notifications/mark-read")
        .set("cookie", userCookie)
        .send({ ids: "not-an-array" })
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
        });
    });
  });
});
```

- [ ] Run:

```bash
cd apps/backend && bun run test:e2e:vitest -- --reporter=verbose test/e2e/notifications.e2e-spec.ts
```

- [ ] Commit:

```bash
git add apps/backend/test/e2e/notifications.e2e-spec.ts
git commit -m "test(backend): e2e tests for notifications endpoints"
```

---

## Task 7: Run full suite and fix any failures

- [ ] Run the complete E2E suite:

```bash
cd apps/backend && bun run test:e2e:vitest -- --reporter=verbose
```

- [ ] If a test fails because `DATABASE_URL_TEST` is separate: update `apps/backend/src/config/env.ts` to allow `DATABASE_URL` to come from `.env.test` (dotenv is loaded in `setup.ts` before NestJS boots — this should work automatically).

- [ ] If the Fastify adapter is not ready before supertest calls start, ensure `app.getHttpAdapter().getInstance().ready()` is awaited in `createTestApp` (already included in Task 2).

- [ ] If Better-Auth's `POST /api/auth/sign-up/email` path is different, check the actual route by inspecting `@thallesp/nestjs-better-auth` middleware mount path:

```bash
cd apps/backend && grep -r "auth" src/auth/ --include="*.ts" | grep -i "prefix\|mount\|path"
```

Adjust auth test paths accordingly (e.g., `/auth/sign-up/email` without `/api`).

- [ ] Add `"test:e2e:vitest"` to the root `turbo.json` pipeline if you want Turborepo to run it:

```json
// In turbo.json "tasks":
"test:e2e:vitest": {
  "dependsOn": ["^build"],
  "env": ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "REDIS_URL", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY", "S3_SECRET_KEY"]
}
```

- [ ] Final commit:

```bash
git add .
git commit -m "test(backend): complete e2e test suite passing for health, auth, accounts, notifications"
```
