---
name: nest-module
description: Use this skill when creating a new NestJS module in the apps/backend application. Covers generating the module, controller, service, and repository files following project conventions, then registering the module in a parent or app module.
---

# Skill: Create a NestJS Module

## Prerequisites

Before creating a module, verify these exist (or create them first):

- **Zod validators** — `packages/validators/<domain>/index.ts` (see `nest-validator` skill)
- **DB schema/table** — `packages/db/src/schema/<domain>.ts` exported from `@repo/db` (see `drizzle-migration` skill)

If either is missing, create them first.

---

## Step-by-step

### 1. Create the module directory

```
apps/backend/src/modules/<domain>/
```

### 2. Create the 4 module files

#### `<domain>.module.ts`

```ts
import { Module } from '@nestjs/common';
import { <Domain>Controller } from './<domain>.controller';
import { <Domain>Repository } from './<domain>.repository';
import { <Domain>Service } from './<domain>.service';

@Module({
  controllers: [<Domain>Controller],
  providers: [<Domain>Service, <Domain>Repository],
  exports: [<Domain>Service],
})
export class <Domain>Module {}
```

#### `<domain>.controller.ts`

```ts
import { Permissions } from '@/auth/permission';
import { ApiZodOkResponse } from '@/common/decorators/zod-response.decorators';
import { ZodBody, ZodQuery } from '@/common/decorators/zod.decorators';
import { Controller, Get, Param, ParseUUIDPipe, Post, Patch, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  <domain>ResponseSchema,
  paginationQuerySchema,
  type <Domain>Response,
  type PaginationQuery,
} from '@repo/validators/<domain>';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { <Domain>Service } from './<domain>.service';

@ApiTags('<group>/<domain>s')
@ApiBearerAuth()
@Controller({ path: '<group>/<domain>s', version: '1' })
export class <Domain>Controller {
  constructor(private readonly <domain>Service: <Domain>Service) {}

  @Get()
  @ApiOperation({ summary: 'List all <domain>s' })
  @ApiZodOkResponse(<domain>ResponseSchema)
  @UserHasPermission({ permission: Permissions.<domain>s.read })
  findAll(@ZodQuery(paginationQuerySchema) query: PaginationQuery): Promise<<Domain>Response[]> {
    return this.<domain>Service.findAll(query.page, query.limit, query.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get <domain> by id' })
  @ApiZodOkResponse(<domain>ResponseSchema)
  @UserHasPermission({ permission: Permissions.<domain>s.read })
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<<Domain>Response> {
    return this.<domain>Service.findById(id);
  }
}
```

> Add `@Post`, `@Patch`, `@Delete` endpoints as needed using `@ZodBody` for request body validation.

#### `<domain>.service.ts`

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { <domain>ResponseSchema, type <Domain>Response } from '@repo/validators/<domain>';
import { <Domain>Repository } from './<domain>.repository';

@Injectable()
export class <Domain>Service {
  constructor(private readonly <domain>Repository: <Domain>Repository) {}

  async findAll(page = 1, limit = 20, search?: string): Promise<<Domain>Response[]> {
    const rows = await this.<domain>Repository.findAll(page, limit, search);
    return rows.map((r) => <domain>ResponseSchema.parse(r));
  }

  async findById(id: string): Promise<<Domain>Response> {
    const found = await this.<domain>Repository.findById(id);
    if (!found) throw new NotFoundException(`<Domain> ${id} not found`);
    return <domain>ResponseSchema.parse(found);
  }
}
```

#### `<domain>.repository.ts`

```ts
import { DATABASE_TOKEN } from '@/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import type { db as DbType } from '@repo/db';
import { <domain> } from '@repo/db';
import { <domain>ResponseSchema, type <Domain>Response } from '@repo/validators/<domain>';
import { eq, ilike, and } from 'drizzle-orm';

type DB = typeof DbType;

@Injectable()
export class <Domain>Repository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  async findAll(page: number, limit: number, search?: string): Promise<<Domain>Response[]> {
    const offset = (page - 1) * limit;
    const rows = await this.db
      .select()
      .from(<domain>)
      .where(search ? ilike(<domain>.name, `%${search}%`) : undefined)
      .limit(limit)
      .offset(offset);
    return rows.map((r) => <domain>ResponseSchema.parse(r));
  }

  async findById(id: string): Promise<<Domain>Response | null> {
    const [found] = await this.db.select().from(<domain>).where(eq(<domain>.id, id));
    if (!found) return null;
    return <domain>ResponseSchema.parse(found);
  }
}
```

---

### 3. Register the module

**Option A — in a parent feature module** (e.g. `accounts.module.ts`):

```ts
import { Module } from '@nestjs/common';
import { <Domain>Module } from './<domain>/<domain>.module';

@Module({ imports: [<Domain>Module] })
export class <ParentDomain>Module {}
```

**Option B — directly in `app.module.ts`**:

```ts
import { <Domain>Module } from './modules/<domain>/<domain>.module';

@Module({
  imports: [
    // ...existing modules
    <Domain>Module,
  ],
})
export class AppModule {}
```

---

## Key conventions

| Convention       | Detail                                                             |
| ---------------- | ------------------------------------------------------------------ |
| Path alias       | `@/` maps to `src/`                                                |
| Validators       | `@repo/validators/<domain>` — Zod schemas for all I/O              |
| DB tables        | `@repo/db` — Drizzle table objects                                 |
| DB injection     | `@Inject(DATABASE_TOKEN)` with type `typeof db`                    |
| Auth guard       | `@UserHasPermission` from `@thallesp/nestjs-better-auth`           |
| Permissions      | Defined in `@/auth/permission` as `Permissions.<domain>s.<action>` |
| Response parsing | Always parse through Zod schema before returning                   |
| Swagger          | `@ApiTags`, `@ApiOperation`, `@ApiZodOkResponse` on every endpoint |
| Versioning       | `version: '1'` on every controller                                 |

---

## Checklist

- [ ] Validators exist in `packages/validators/<domain>/index.ts`
- [ ] DB table exists in `packages/db` and is exported from `@repo/db`
- [ ] `<domain>.module.ts` created
- [ ] `<domain>.controller.ts` created with Swagger decorators
- [ ] `<domain>.service.ts` created
- [ ] `<domain>.repository.ts` created with `DATABASE_TOKEN` injection
- [ ] Module registered in parent module or `app.module.ts`
- [ ] Permissions added to `@/auth/permission` if new actions are needed
