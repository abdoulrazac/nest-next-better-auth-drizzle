---
name: nest-endpoint
description: Use when adding a new REST endpoint to an existing NestJS module in this project. Covers the full vertical slice: validator schema → permission → repository → service → controller.
---

# Adding a NestJS REST Endpoint

Follow these steps in order. Each layer depends on the previous one.

---

## Step 1 — Validator schema

File: `packages/validators/<domain>/index.ts`  
Import alias: `@repo/validators/<domain>`

Add request and/or response schemas using Zod. Export inferred types.

```ts
import { z } from "zod";

// Request body (for POST/PATCH)
export const createThingSchema = z.object({
  name: z.string().min(1),
  // ...
});
export type CreateThing = z.infer<typeof createThingSchema>;

// Response
export const thingResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.coerce.date(),
});
export type ThingResponse = z.infer<typeof thingResponseSchema>;
```

Rules:

- Never use `class-validator`. Zod only.
- Schemas used for responses must be strict enough to parse Drizzle rows safely.

---

## Step 2 — Permission (if new action)

File: `src/auth/permission.ts`

Add the new action to the relevant resource object:

```ts
export const Permissions = {
  things: {
    read: { things: ["read"] as string[] },
    write: { things: ["write"] as string[] },
    delete: { things: ["delete"] as string[] },
  },
};
```

Skip this step if the permission already exists.

---

## Step 3 — Repository method

File: `src/<module>/<module>.repository.ts`

Add the Drizzle query. Return `null` when a single row is not found; return an array for list queries.

```ts
// Single row
async findById(id: string): Promise<ThingResponse | null> {
  const [found] = await this.db
    .select()
    .from(thing)
    .where(eq(thing.id, id));
  if (!found) return null;
  return thingResponseSchema.parse(found);
}

// List
async findAll(): Promise<ThingResponse[]> {
  const rows = await this.db.select().from(thing);
  return rows.map((r) => thingResponseSchema.parse(r));
}

// Create
async create(data: CreateThing): Promise<ThingResponse> {
  const [created] = await this.db
    .insert(thing)
    .values({ id: crypto.randomUUID(), ...data })
    .returning();
  return thingResponseSchema.parse(created);
}

// Update
async update(id: string, data: Partial<CreateThing>): Promise<ThingResponse | null> {
  const [updated] = await this.db
    .update(thing)
    .set(data)
    .where(eq(thing.id, id))
    .returning();
  if (!updated) return null;
  return thingResponseSchema.parse(updated);
}

// Delete
async delete(id: string): Promise<void> {
  await this.db.delete(thing).where(eq(thing.id, id));
}
```

---

## Step 4 — Service method

File: `src/<module>/<module>.service.ts`

Call the repository method. Throw NestJS exceptions for error cases. Always return data already parsed by Zod (the repository handles parsing, so just return the value).

```ts
async findById(id: string): Promise<ThingResponse> {
  const found = await this.thingsRepository.findById(id);
  if (!found) throw new NotFoundException(`Thing ${id} not found`);
  return found;
}

async create(data: CreateThing): Promise<ThingResponse> {
  return this.thingsRepository.create(data);
}

async update(id: string, data: Partial<CreateThing>): Promise<ThingResponse> {
  const updated = await this.thingsRepository.update(id, data);
  if (!updated) throw new NotFoundException(`Thing ${id} not found`);
  return updated;
}

async delete(id: string): Promise<void> {
  await this.thingsRepository.delete(id);
}
```

Allowed exceptions from `@nestjs/common`:

- `NotFoundException` — resource not found
- `BadRequestException` — invalid input not caught by schema
- `ForbiddenException` — business-level access denial (rare; RBAC guard handles most cases)

---

## Step 5 — Controller endpoint

File: `src/<module>/<module>.controller.ts`

Every endpoint needs **all three** of: `@ApiOperation`, `@ApiZodOkResponse`, `@UserHasPermission`.

```ts
// GET list
@Get()
@ApiOperation({ summary: 'List all things' })
@ApiZodOkResponse(z.array(thingResponseSchema))
@UserHasPermission({ permission: Permissions.things.read })
findAll(
  @ZodQuery(paginationQuerySchema) query: PaginationQuery,
  @ZodQuery(thingFilterQuerySchema) filterQuery: ThingFilterQuery,
): Promise<ThingResponse[]> {
  return this.thingsService.findAll();
}

// GET single
@Get(':id')
@ApiOperation({ summary: 'Get thing by id' })
@ApiZodOkResponse(thingResponseSchema)
@UserHasPermission({ permission: Permissions.things.read })
findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ThingResponse> {
  return this.thingsService.findById(id);
}

// POST
@Post()
@ApiOperation({ summary: 'Create a thing' })
@ApiZodOkResponse(thingResponseSchema)
@UserHasPermission({ permission: Permissions.things.write })
create(@ZodBody(createThingSchema) body: CreateThing): Promise<ThingResponse> {
  return this.thingsService.create(body);
}

// PATCH
@Patch(':id')
@ApiOperation({ summary: 'Update a thing' })
@ApiZodOkResponse(thingResponseSchema)
@UserHasPermission({ permission: Permissions.things.write })
update(
  @Param('id', ParseUUIDPipe) id: string,
  @ZodBody(createThingSchema.partial()) body: Partial<CreateThing>,
): Promise<ThingResponse> {
  return this.thingsService.update(id, body);
}

// DELETE
@Delete(':id')
@HttpCode(204)
@ApiOperation({ summary: 'Delete a thing' })
@ApiNoContentResponse()
@UserHasPermission({ permission: Permissions.things.delete })
delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
  return this.thingsService.delete(id);
}
```

Controller class decorators (must already be present or add them):

```ts
@ApiTags('things')
@ApiBearerAuth()
@Controller('things')
export class ThingsController { ... }
```

Decorator import sources:

- `@ZodBody`, `@ZodQuery`, `@ApiZodOkResponse` — custom decorators in `src/common/decorators/` (or wherever they live in this project — verify with `grep -r "ZodBody" src/`)
- `@UserHasPermission` — `src/auth/`
- `@ApiOperation`, `@ApiBearerAuth`, `@ApiTags`, `@ApiNoContentResponse` — `@nestjs/swagger`
- `@Get`, `@Post`, `@Patch`, `@Delete`, `@Param`, `@Controller`, `@HttpCode` — `@nestjs/common`
- `ParseUUIDPipe` — `@nestjs/common`

---

## Checklist

Before marking the task complete, verify each item:

- [ ] Validator schema added to `packages/validators/<module>.ts` and exported
- [ ] Inferred TypeScript types exported alongside each schema
- [ ] Permission entry exists in `src/auth/permission.ts` for the action used
- [ ] Repository method returns `null` (not throws) when a row is missing
- [ ] Repository method parses every returned row with `.parse()` before returning
- [ ] Service method throws `NotFoundException` when repository returns `null`
- [ ] Service method uses only `@nestjs/common` exceptions (not raw `Error`)
- [ ] Controller endpoint has `@ApiOperation`
- [ ] Controller endpoint has `@ApiZodOkResponse` (or `@ApiNoContentResponse` for 204)
- [ ] Controller endpoint has `@UserHasPermission`
- [ ] Body validated with `@ZodBody(schema)` — no `class-validator` DTOs
- [ ] Query params validated with `@ZodQuery(schema)` if query params are used
- [ ] UUID path params use `@Param('id', ParseUUIDPipe)`
- [ ] Controller class has `@ApiBearerAuth()` and `@ApiTags(...)`
- [ ] No raw `class-validator` imports anywhere in the touched files
