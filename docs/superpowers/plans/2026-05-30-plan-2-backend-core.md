# Plan 2 — Backend Core

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer le backend NestJS barebone en une API enterprise complète avec Fastify, Better-Auth, RBAC, module `accounts` (users + roles + audit-logs), Swagger/OpenAPI, validation Zod globale et intercepteur d'audit.

**Architecture:** NestJS avec FastifyAdapter. Better-Auth gère l'auth via `@thallesp/nestjs-better-auth` (guard global, décorateurs RBAC). Drizzle ORM via `@repo/db`. Validation via `ZodValidationPipe` global + `@repo/validators`. Structure par domaine sous `src/modules/accounts/`.

**Tech Stack:** NestJS 11, Fastify, Better-Auth 1.5+, `@thallesp/nestjs-better-auth`, Drizzle ORM, `@nestjs/swagger`, `@anatine/zod-nestjs`, `@repo/db`, `@repo/validators`

---

## Fichiers créés ou modifiés

### Bootstrap & Config

- Modifier : `apps/backend/package.json` — ajouter dépendances Fastify, Better-Auth, Drizzle, Swagger
- Modifier : `apps/backend/src/main.ts` — FastifyAdapter, Swagger setup, versioning
- Modifier : `apps/backend/src/app.module.ts` — importer AuthModule, DbModule, AccountsModule
- Créer : `apps/backend/src/config/env.ts` — validation Zod des variables d'environnement
- Supprimer : `apps/backend/src/app.controller.ts`, `apps/backend/src/app.service.ts`, `apps/backend/src/app.controller.spec.ts`

### Auth

- Créer : `apps/backend/src/auth/auth.ts` — config Better-Auth (admin plugin + access control)
- Créer : `apps/backend/src/auth/auth.module.ts` — AuthModule.forRoot

### Common

- Créer : `apps/backend/src/common/decorators/current-user.decorator.ts`
- Créer : `apps/backend/src/common/interceptors/audit-log.interceptor.ts`
- Créer : `apps/backend/src/common/pipes/zod-validation.pipe.ts`

### Module Accounts

- Créer : `apps/backend/src/modules/accounts/accounts.module.ts`
- Créer : `apps/backend/src/modules/accounts/users/users.controller.ts`
- Créer : `apps/backend/src/modules/accounts/users/users.service.ts`
- Créer : `apps/backend/src/modules/accounts/users/users.repository.ts`
- Créer : `apps/backend/src/modules/accounts/roles/roles.controller.ts`
- Créer : `apps/backend/src/modules/accounts/roles/roles.service.ts`
- Créer : `apps/backend/src/modules/accounts/roles/roles.repository.ts`
- Créer : `apps/backend/src/modules/accounts/audit-logs/audit-logs.controller.ts`
- Créer : `apps/backend/src/modules/accounts/audit-logs/audit-logs.service.ts`
- Créer : `apps/backend/src/modules/accounts/audit-logs/audit-logs.repository.ts`

### Module Health

- Créer : `apps/backend/src/modules/health/health.module.ts`
- Créer : `apps/backend/src/modules/health/health.controller.ts`

---

## Task 1 : Dépendances & configuration du package

**Files:**

- Modifier : `apps/backend/package.json`
- Modifier : `apps/backend/src/config/env.ts` (nouveau fichier)

- [ ] **Step 1 : Installer les dépendances**

```bash
cd apps/backend
bun add @nestjs/platform-fastify fastify
bun add better-auth @thallesp/nestjs-better-auth
bun add @nestjs/swagger @anatine/zod-nestjs zod
bun add drizzle-orm postgres
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
bun add ioredis
bun add @nestjs/terminus
```

- [ ] **Step 2 : Ajouter les devDependencies**

```bash
bun add -D @types/node
```

- [ ] **Step 3 : Créer `apps/backend/src/config/env.ts`**

```typescript
// apps/backend/src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // S3 / MinIO
  S3_ENDPOINT: z.string().url("S3_ENDPOINT must be a valid URL"),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_REGION: z.string().default("us-east-1"),

  // Redis
  REDIS_URL: z.string().url("REDIS_URL must be a valid URL"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const messages = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${messages}`);
  }

  return result.data;
}

export const env = validateEnv();
```

- [ ] **Step 4 : Vérifier les types**

```bash
cd apps/backend
bunx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add apps/backend/
git commit -m "chore(backend): install dependencies and add env validation"
```

---

## Task 2 : Bootstrap Fastify + Swagger

**Files:**

- Modifier : `apps/backend/src/main.ts`
- Supprimer : `apps/backend/src/app.controller.ts`, `apps/backend/src/app.service.ts`, `apps/backend/src/app.controller.spec.ts`
- Modifier : `apps/backend/src/app.module.ts` — version minimale sans AppController/AppService

- [ ] **Step 1 : Supprimer les fichiers inutiles**

```bash
rm apps/backend/src/app.controller.ts
rm apps/backend/src/app.service.ts
rm apps/backend/src/app.controller.spec.ts
```

- [ ] **Step 2 : Réécrire `apps/backend/src/main.ts`**

```typescript
// apps/backend/src/main.ts
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { VersioningType } from "@nestjs/common";
import { AppModule } from "./app.module";
import { env } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: env.NODE_ENV === "development" }),
  );

  // API versioning
  app.enableVersioning({ type: VersioningType.URI });

  // CORS
  app.enableCors({
    origin: env.BETTER_AUTH_URL,
    credentials: true,
  });

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle("Enterprise API")
    .setDescription("Enterprise boilerplate API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(env.PORT, "0.0.0.0");
  console.log(`Application running on: http://localhost:${env.PORT}`);
  console.log(`Swagger docs: http://localhost:${env.PORT}/api/docs`);
}

bootstrap();
```

- [ ] **Step 3 : Réécrire `apps/backend/src/app.module.ts`** (version minimale)

```typescript
// apps/backend/src/app.module.ts
import { Module } from "@nestjs/common";

@Module({
  imports: [],
})
export class AppModule {}
```

- [ ] **Step 4 : Créer le fichier `.env` local pour le backend**

```bash
cp .env.example apps/backend/.env
```

- [ ] **Step 5 : Vérifier que l'app démarre**

```bash
cd apps/backend
bun start:dev
```

Résultat attendu : l'app démarre sans erreur sur le port 3000. Arrêter avec Ctrl+C.

- [ ] **Step 6 : Commit**

```bash
git add apps/backend/src/main.ts apps/backend/src/app.module.ts apps/backend/.env
git commit -m "feat(backend): setup fastify adapter with swagger and api versioning"
```

---

## Task 3 : Auth module (Better-Auth + Fastify)

**Files:**

- Créer : `apps/backend/src/auth/auth.ts`
- Créer : `apps/backend/src/auth/auth.module.ts`
- Modifier : `apps/backend/src/app.module.ts`

- [ ] **Step 1 : Créer `apps/backend/src/auth/auth.ts`**

```typescript
// apps/backend/src/auth/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAccessControl } from "better-auth/plugins/admin";
import { db, schema } from "@repo/db";
import { env } from "../config/env";

// Define permissions per resource
const statement = {
  users: ["read", "write", "delete"],
  roles: ["read", "write", "delete"],
  "audit-logs": ["read"],
  files: ["upload", "read", "delete"],
  settings: ["read", "manage"],
  notifications: ["read", "manage"],
  webhooks: ["read", "write", "delete"],
} as const;

const ac = createAccessControl(statement);

// Define system roles
const adminRole = ac.newRole({
  users: ["read", "write", "delete"],
  roles: ["read", "write", "delete"],
  "audit-logs": ["read"],
  files: ["upload", "read", "delete"],
  settings: ["read", "manage"],
  notifications: ["read", "manage"],
  webhooks: ["read", "write", "delete"],
});

const memberRole = ac.newRole({
  users: ["read"],
  files: ["upload", "read"],
  notifications: ["read"],
  settings: ["read"],
});

const viewerRole = ac.newRole({
  users: ["read"],
  files: ["read"],
  notifications: ["read"],
  settings: ["read"],
});

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  // OAuth providers — uncomment to enable:
  // socialProviders: {
  //   google: {
  //     clientId: env.GOOGLE_CLIENT_ID!,
  //     clientSecret: env.GOOGLE_CLIENT_SECRET!,
  //   },
  //   github: {
  //     clientId: env.GITHUB_CLIENT_ID!,
  //     clientSecret: env.GITHUB_CLIENT_SECRET!,
  //   },
  // },
  plugins: [
    admin({
      ac,
      roles: {
        admin: adminRole,
        member: memberRole,
        viewer: viewerRole,
      },
      defaultRole: "member",
    }),
  ],
  // Hooks — uncomment to enable:
  // hooks: {},
  // databaseHooks: {},
});

export type Auth = typeof auth;
```

- [ ] **Step 2 : Créer `apps/backend/src/auth/auth.module.ts`**

```typescript
// apps/backend/src/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./auth";

@Module({
  imports: [
    BetterAuthModule.forRoot({
      auth,
      // disableGlobalAuthGuard: false, // true = manage guards manually
    }),
  ],
  exports: [BetterAuthModule],
})
export class AuthModule {}
```

- [ ] **Step 3 : Mettre à jour `apps/backend/src/app.module.ts`**

```typescript
// apps/backend/src/app.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [AuthModule],
})
export class AppModule {}
```

- [ ] **Step 4 : Vérifier le démarrage**

```bash
cd apps/backend
bun start:dev
```

Résultat attendu : l'app démarre, les routes Better-Auth sont disponibles sur `/api/auth/*`. Arrêter avec Ctrl+C.

- [ ] **Step 5 : Vérifier les types**

```bash
bunx tsc --noEmit
```

- [ ] **Step 6 : Commit**

```bash
git add apps/backend/src/auth/
git commit -m "feat(backend): add better-auth module with admin plugin and RBAC"
```

---

## Task 4 : Common — ZodValidationPipe + CurrentUser decorator + AuditLogInterceptor

**Files:**

- Créer : `apps/backend/src/common/pipes/zod-validation.pipe.ts`
- Créer : `apps/backend/src/common/decorators/current-user.decorator.ts`
- Créer : `apps/backend/src/common/interceptors/audit-log.interceptor.ts`

- [ ] **Step 1 : Créer `apps/backend/src/common/pipes/zod-validation.pipe.ts`**

```typescript
// apps/backend/src/common/pipes/zod-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = this.formatErrors(result.error);
      throw new BadRequestException({
        message: "Validation failed",
        errors,
      });
    }

    return result.data;
  }

  private formatErrors(error: ZodError) {
    return error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
  }
}
```

- [ ] **Step 2 : Créer `apps/backend/src/common/decorators/current-user.decorator.ts`**

```typescript
// apps/backend/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";

/**
 * Returns the current authenticated user from the session.
 * Wraps @Session() from @thallesp/nestjs-better-auth.
 *
 * @example
 * @Get('me')
 * getProfile(@CurrentUser() user: UserSession['user']) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

- [ ] **Step 3 : Créer `apps/backend/src/common/interceptors/audit-log.interceptor.ts`**

```typescript
// apps/backend/src/common/interceptors/audit-log.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { db } from "@repo/db";
import { auditLog } from "@repo/db/schema";

const MUTATION_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async () => {
        if (!user?.id) return;

        // Extract resource and resourceId from URL
        // e.g. /api/v1/accounts/users/123 → resource: "users", resourceId: "123"
        const segments = url.split("/").filter(Boolean);
        const resource =
          segments[segments.length - 2] ??
          segments[segments.length - 1] ??
          "unknown";
        const resourceId = segments[segments.length - 1];
        const isUuid = /^[0-9a-f-]{36}$/.test(resourceId ?? "");

        await db.insert(auditLog).values({
          userId: user.id,
          action: method.toLowerCase(),
          resource,
          resourceId: isUuid ? resourceId : null,
          metadata: { url, duration: Date.now() - startTime },
          ipAddress: ip ?? headers["x-forwarded-for"],
          userAgent: headers["user-agent"],
        });
      }),
    );
  }
}
```

- [ ] **Step 4 : Vérifier les types**

```bash
cd apps/backend && bunx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add apps/backend/src/common/
git commit -m "feat(backend): add zod validation pipe, current-user decorator and audit-log interceptor"
```

---

## Task 5 : Module Health

**Files:**

- Créer : `apps/backend/src/modules/health/health.module.ts`
- Créer : `apps/backend/src/modules/health/health.controller.ts`
- Modifier : `apps/backend/src/app.module.ts`

- [ ] **Step 1 : Créer `apps/backend/src/modules/health/health.controller.ts`**

```typescript
// apps/backend/src/modules/health/health.controller.ts
import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from "@nestjs/terminus";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller({ path: "health", version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
  ) {}

  @Get()
  @AllowAnonymous()
  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}
```

- [ ] **Step 2 : Créer `apps/backend/src/modules/health/health.module.ts`**

```typescript
// apps/backend/src/modules/health/health.module.ts
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HttpModule } from "@nestjs/axios";
import { HealthController } from "./health.controller";

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 3 : Installer `@nestjs/axios`**

```bash
cd apps/backend && bun add @nestjs/axios axios
```

- [ ] **Step 4 : Mettre à jour `apps/backend/src/app.module.ts`**

```typescript
// apps/backend/src/app.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [AuthModule, HealthModule],
})
export class AppModule {}
```

- [ ] **Step 5 : Vérifier que le endpoint health répond**

```bash
cd apps/backend && bun start:dev &
sleep 5
curl http://localhost:3000/health
```

Résultat attendu : `{"status":"ok","info":{},"error":{},"details":{}}`

Arrêter le serveur.

- [ ] **Step 6 : Commit**

```bash
git add apps/backend/src/modules/health/ apps/backend/src/app.module.ts
git commit -m "feat(backend): add health module with terminus"
```

---

## Task 6 : Module Accounts — Repository + Service + Controller (Users)

**Files:**

- Créer : `apps/backend/src/modules/accounts/accounts.module.ts`
- Créer : `apps/backend/src/modules/accounts/users/users.repository.ts`
- Créer : `apps/backend/src/modules/accounts/users/users.service.ts`
- Créer : `apps/backend/src/modules/accounts/users/users.controller.ts`

- [ ] **Step 1 : Créer `apps/backend/src/modules/accounts/users/users.repository.ts`**

```typescript
// apps/backend/src/modules/accounts/users/users.repository.ts
import { Injectable } from "@nestjs/common";
import { db, user, schema } from "@repo/db";
import { eq, ilike, count, and, SQL } from "drizzle-orm";

export interface FindUsersOptions {
  page: number;
  limit: number;
  search?: string;
}

@Injectable()
export class UsersRepository {
  async findAll(options: FindUsersOptions) {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (search) {
      conditions.push(ilike(user.name, `%${search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(user)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(user.createdAt),
      db.select({ total: count() }).from(user).where(where),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    const [found] = await db.select().from(user).where(eq(user.id, id));
    return found ?? null;
  }

  async findByEmail(email: string) {
    const [found] = await db.select().from(user).where(eq(user.email, email));
    return found ?? null;
  }

  async update(id: string, data: Partial<typeof user.$inferInsert>) {
    const [updated] = await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return updated ?? null;
  }

  async ban(id: string, reason?: string, expiresAt?: Date) {
    return this.update(id, {
      banned: true,
      banReason: reason,
      banExpires: expiresAt,
    });
  }

  async unban(id: string) {
    return this.update(id, {
      banned: false,
      banReason: null,
      banExpires: null,
    });
  }
}
```

- [ ] **Step 2 : Créer `apps/backend/src/modules/accounts/users/users.service.ts`**

```typescript
// apps/backend/src/modules/accounts/users/users.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import type { UpdateUserInput } from "@repo/validators/accounts";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(page: number, limit: number, search?: string) {
    return this.usersRepository.findAll({ page, limit, search });
  }

  async findById(id: string) {
    const found = await this.usersRepository.findById(id);
    if (!found) throw new NotFoundException(`User ${id} not found`);
    return found;
  }

  async update(id: string, data: UpdateUserInput) {
    await this.findById(id); // throws if not found
    return this.usersRepository.update(id, data);
  }

  async ban(id: string, reason?: string, expiresAt?: Date) {
    await this.findById(id);
    return this.usersRepository.ban(id, reason, expiresAt);
  }

  async unban(id: string) {
    await this.findById(id);
    return this.usersRepository.unban(id);
  }
}
```

- [ ] **Step 3 : Créer `apps/backend/src/modules/accounts/users/users.controller.ts`**

```typescript
// apps/backend/src/modules/accounts/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  Version,
  ParseUUIDPipe,
  UsePipes,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserHasPermission } from "@thallesp/nestjs-better-auth";
import { UsersService } from "./users.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { AuditLogInterceptor } from "../../../common/interceptors/audit-log.interceptor";
import {
  updateUserSchema,
  type UpdateUserInput,
} from "@repo/validators/accounts";

@ApiTags("accounts/users")
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: "accounts/users", version: "1" })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "List all users" })
  @UserHasPermission({ permission: { users: ["read"] } })
  findAll(
    @Query("page") page = 1,
    @Query("limit") limit = 20,
    @Query("search") search?: string,
  ) {
    return this.usersService.findAll(Number(page), Number(limit), search);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  @UserHasPermission({ permission: { users: ["read"] } })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user" })
  @UserHasPermission({ permission: { users: ["write"] } })
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateUserInput,
  ) {
    return this.usersService.update(id, body);
  }

  @Post(":id/ban")
  @ApiOperation({ summary: "Ban user" })
  @UserHasPermission({ permission: { users: ["delete"] } })
  ban(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
  ) {
    return this.usersService.ban(id, body.reason);
  }

  @Post(":id/unban")
  @ApiOperation({ summary: "Unban user" })
  @UserHasPermission({ permission: { users: ["delete"] } })
  unban(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.unban(id);
  }
}
```

- [ ] **Step 4 : Créer `apps/backend/src/modules/accounts/accounts.module.ts`** (partiel — sera complété avec roles et audit-logs)

```typescript
// apps/backend/src/modules/accounts/accounts.module.ts
import { Module } from "@nestjs/common";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";
import { UsersRepository } from "./users/users.repository";

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class AccountsModule {}
```

- [ ] **Step 5 : Mettre à jour `apps/backend/src/app.module.ts`**

```typescript
// apps/backend/src/app.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { AccountsModule } from "./modules/accounts/accounts.module";

@Module({
  imports: [AuthModule, HealthModule, AccountsModule],
})
export class AppModule {}
```

- [ ] **Step 6 : Vérifier les types**

```bash
cd apps/backend && bunx tsc --noEmit
```

- [ ] **Step 7 : Commit**

```bash
git add apps/backend/src/modules/accounts/
git commit -m "feat(backend): add accounts module with users CRUD"
```

---

## Task 7 : Module Accounts — Roles + Audit Logs

**Files:**

- Créer : `apps/backend/src/modules/accounts/roles/roles.repository.ts`
- Créer : `apps/backend/src/modules/accounts/roles/roles.service.ts`
- Créer : `apps/backend/src/modules/accounts/roles/roles.controller.ts`
- Créer : `apps/backend/src/modules/accounts/audit-logs/audit-logs.repository.ts`
- Créer : `apps/backend/src/modules/accounts/audit-logs/audit-logs.service.ts`
- Créer : `apps/backend/src/modules/accounts/audit-logs/audit-logs.controller.ts`
- Modifier : `apps/backend/src/modules/accounts/accounts.module.ts`

- [ ] **Step 1 : Créer `apps/backend/src/modules/accounts/roles/roles.repository.ts`**

```typescript
// apps/backend/src/modules/accounts/roles/roles.repository.ts
import { Injectable } from "@nestjs/common";
import { db, role, userRole } from "@repo/db";
import { eq } from "drizzle-orm";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "@repo/validators/accounts";

@Injectable()
export class RolesRepository {
  async findAll() {
    return db.select().from(role).orderBy(role.name);
  }

  async findById(id: string) {
    const [found] = await db.select().from(role).where(eq(role.id, id));
    return found ?? null;
  }

  async create(data: CreateRoleInput) {
    const [created] = await db
      .insert(role)
      .values({
        name: data.name,
        permissions: data.permissions,
      })
      .returning();
    return created;
  }

  async update(id: string, data: UpdateRoleInput) {
    const [updated] = await db
      .update(role)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(role.id, id))
      .returning();
    return updated ?? null;
  }

  async delete(id: string) {
    const [deleted] = await db.delete(role).where(eq(role.id, id)).returning();
    return deleted ?? null;
  }

  async assignToUser(userId: string, roleId: string) {
    const [created] = await db
      .insert(userRole)
      .values({ userId, roleId })
      .onConflictDoNothing()
      .returning();
    return created;
  }

  async removeFromUser(userId: string, roleId: string) {
    const [deleted] = await db
      .delete(userRole)
      .where(eq(userRole.userId, userId))
      .returning();
    return deleted ?? null;
  }
}
```

- [ ] **Step 2 : Créer `apps/backend/src/modules/accounts/roles/roles.service.ts`**

```typescript
// apps/backend/src/modules/accounts/roles/roles.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { RolesRepository } from "./roles.repository";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "@repo/validators/accounts";

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  findAll() {
    return this.rolesRepository.findAll();
  }

  async findById(id: string) {
    const found = await this.rolesRepository.findById(id);
    if (!found) throw new NotFoundException(`Role ${id} not found`);
    return found;
  }

  async create(data: CreateRoleInput) {
    return this.rolesRepository.create(data);
  }

  async update(id: string, data: UpdateRoleInput) {
    await this.findById(id);
    return this.rolesRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.rolesRepository.delete(id);
  }

  async assignToUser(userId: string, roleId: string) {
    await this.findById(roleId);
    return this.rolesRepository.assignToUser(userId, roleId);
  }
}
```

- [ ] **Step 3 : Créer `apps/backend/src/modules/accounts/roles/roles.controller.ts`**

```typescript
// apps/backend/src/modules/accounts/roles/roles.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserHasPermission } from "@thallesp/nestjs-better-auth";
import { RolesService } from "./roles.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { AuditLogInterceptor } from "../../../common/interceptors/audit-log.interceptor";
import {
  createRoleSchema,
  updateRoleSchema,
  type CreateRoleInput,
  type UpdateRoleInput,
} from "@repo/validators/accounts";

@ApiTags("accounts/roles")
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: "accounts/roles", version: "1" })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: "List all roles" })
  @UserHasPermission({ permission: { roles: ["read"] } })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get role by id" })
  @UserHasPermission({ permission: { roles: ["read"] } })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create role" })
  @UserHasPermission({ permission: { roles: ["write"] } })
  @UsePipes(new ZodValidationPipe(createRoleSchema))
  create(@Body() body: CreateRoleInput) {
    return this.rolesService.create(body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update role" })
  @UserHasPermission({ permission: { roles: ["write"] } })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateRoleSchema)) body: UpdateRoleInput,
  ) {
    return this.rolesService.update(id, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete role" })
  @UserHasPermission({ permission: { roles: ["delete"] } })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.rolesService.delete(id);
  }

  @Post(":id/assign/:userId")
  @ApiOperation({ summary: "Assign role to user" })
  @UserHasPermission({ permission: { roles: ["write"] } })
  assignToUser(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("userId", ParseUUIDPipe) userId: string,
  ) {
    return this.rolesService.assignToUser(userId, id);
  }
}
```

- [ ] **Step 4 : Créer `apps/backend/src/modules/accounts/audit-logs/audit-logs.repository.ts`**

```typescript
// apps/backend/src/modules/accounts/audit-logs/audit-logs.repository.ts
import { Injectable } from "@nestjs/common";
import { db, auditLog } from "@repo/db";
import { eq, and, gte, lte, count, type SQL } from "drizzle-orm";
import type { AuditLogQuery } from "@repo/validators/accounts";

@Injectable()
export class AuditLogsRepository {
  async findAll(query: AuditLogQuery) {
    const { page, limit, userId, action, from, to } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (userId) conditions.push(eq(auditLog.userId, userId));
    if (action) conditions.push(eq(auditLog.action, action));
    if (from) conditions.push(gte(auditLog.createdAt, from));
    if (to) conditions.push(lte(auditLog.createdAt, to));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(auditLog)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(auditLog.createdAt),
      db.select({ total: count() }).from(auditLog).where(where),
    ]);

    return { items, total, page, limit };
  }
}
```

- [ ] **Step 5 : Créer `apps/backend/src/modules/accounts/audit-logs/audit-logs.service.ts`**

```typescript
// apps/backend/src/modules/accounts/audit-logs/audit-logs.service.ts
import { Injectable } from "@nestjs/common";
import { AuditLogsRepository } from "./audit-logs.repository";
import type { AuditLogQuery } from "@repo/validators/accounts";

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  findAll(query: AuditLogQuery) {
    return this.auditLogsRepository.findAll(query);
  }
}
```

- [ ] **Step 6 : Créer `apps/backend/src/modules/accounts/audit-logs/audit-logs.controller.ts`**

```typescript
// apps/backend/src/modules/accounts/audit-logs/audit-logs.controller.ts
import { Controller, Get, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserHasPermission } from "@thallesp/nestjs-better-auth";
import { AuditLogsService } from "./audit-logs.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import {
  auditLogQuerySchema,
  type AuditLogQuery,
} from "@repo/validators/accounts";

@ApiTags("accounts/audit-logs")
@ApiBearerAuth()
@Controller({ path: "accounts/audit-logs", version: "1" })
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: "List audit logs" })
  @UserHasPermission({ permission: { "audit-logs": ["read"] } })
  @UsePipes(new ZodValidationPipe(auditLogQuerySchema))
  findAll(@Query() query: AuditLogQuery) {
    return this.auditLogsService.findAll(query);
  }
}
```

- [ ] **Step 7 : Mettre à jour `accounts.module.ts`**

```typescript
// apps/backend/src/modules/accounts/accounts.module.ts
import { Module } from "@nestjs/common";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";
import { UsersRepository } from "./users/users.repository";
import { RolesController } from "./roles/roles.controller";
import { RolesService } from "./roles/roles.service";
import { RolesRepository } from "./roles/roles.repository";
import { AuditLogsController } from "./audit-logs/audit-logs.controller";
import { AuditLogsService } from "./audit-logs/audit-logs.service";
import { AuditLogsRepository } from "./audit-logs/audit-logs.repository";

@Module({
  controllers: [UsersController, RolesController, AuditLogsController],
  providers: [
    UsersService,
    UsersRepository,
    RolesService,
    RolesRepository,
    AuditLogsService,
    AuditLogsRepository,
  ],
})
export class AccountsModule {}
```

- [ ] **Step 8 : Vérifier les types**

```bash
cd apps/backend && bunx tsc --noEmit
```

- [ ] **Step 9 : Commit**

```bash
git add apps/backend/src/modules/accounts/
git commit -m "feat(backend): add roles and audit-logs to accounts module"
```

---

## Task 8 : Vérification finale backend

- [ ] **Step 1 : Démarrer l'app et vérifier les endpoints**

```bash
cd apps/backend && bun start:dev &
sleep 8

# Health check
curl -s http://localhost:3000/health | head -c 200

# Swagger UI disponible
curl -s http://localhost:3000/api/docs -o /dev/null -w "%{http_code}"
```

Résultats attendus :

- `/health` → `{"status":"ok",...}`
- `/api/docs` → `200`

Arrêter le serveur.

- [ ] **Step 2 : Vérifier les types**

```bash
cd apps/backend && bunx tsc --noEmit
```

Résultat attendu : 0 erreurs.

- [ ] **Step 3 : Commit final si besoin**

```bash
git status
# Si des fichiers non commités :
git add -A && git commit -m "chore(backend): finalize backend core"
```
