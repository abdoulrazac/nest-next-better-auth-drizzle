---
name: nest-validator
description: Use when adding a new domain to packages/validators/ in this monorepo — creating Zod schemas (response, input, pagination) and wiring up the package.json export so the backend can import via @repo/validators/<domain>.
---

# Skill: nest-validator

Use this skill whenever you need to add Zod validator schemas for a new domain (e.g. `products`, `orders`, `invoices`) to the `packages/validators/` package in this monorepo.

---

## Package structure

```
packages/validators/
  src/
    shared.schema.ts        ← reusable primitives (uuid, email, pagination, …)
    accounts.ts             ← example domain
    files.ts                ← example domain
    <domain>.ts             ← you will create this
    index.ts                ← barrel (optional re-export)
  package.json              ← exports map — you must add your domain here
  tsconfig.json
```

Each domain lives in its own `src/<domain>.ts` file. It is exposed via a dedicated export path `@repo/validators/<domain>` declared in `package.json`.

---

## Shared primitives (always import from `./shared.schema`)

| Export                                | What it is                                                |
| ------------------------------------- | --------------------------------------------------------- |
| `uuidSchema`                          | `z.string().uuid()`                                       |
| `emailSchema`                         | `z.string().email(...)`                                   |
| `nameMin2Schema`                      | `z.string().min(2, ...)`                                  |
| `nonEmptyStringSchema`                | `z.string().min(1)`                                       |
| `nonNegativeIntSchema`                | `z.number().int().nonnegative()`                          |
| `paginationPageSchema`                | `z.coerce.number().int().positive().default(1)`           |
| `paginationLimitSchema`               | `z.coerce.number().int().positive().max(100).default(20)` |
| `paginatedResponseSchema(itemSchema)` | generic factory → `{ items, total, page, limit }`         |

Always prefer these over re-declaring common shapes.

---

## Schema authoring conventions

### 1. Response schema

Describes the shape returned by the API (mirrors the DB row + computed fields).

```ts
export const productResponseSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1),
  price: z.number().nonnegative(),
  stock: nonNegativeIntSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

### 2. Input schemas (create / update)

```ts
export const createProductSchema = z.object({
  name: nameMin2Schema.max(120, "Name cannot exceed 120 characters"),
  price: z.number().nonnegative("Price must be ≥ 0"),
  stock: nonNegativeIntSchema.default(0),
});

// update = all fields optional; omit fields that must never change (e.g. slug)
export const updateProductSchema = createProductSchema.partial();
```

Use `.partial()` for update schemas. Chain `.omit({ field: true })` when specific fields must be excluded from updates.

Use `.refine()` or `.superRefine()` for cross-field validation:

```ts
export const updateProductSchema = createProductSchema
  .partial()
  .refine((d) => !d.stock || d.stock >= 0, {
    message: "stock cannot be negative",
    path: ["stock"],
  });
```

### 3. Pagination / query schema

```ts
export const productQuerySchema = z.object({
  page: paginationPageSchema,
  limit: paginationLimitSchema,
  search: z.string().optional(),
  categoryId: uuidSchema.optional(),
});
```

### 4. Paginated response schema

```ts
export const productsPaginatedResponseSchema = paginatedResponseSchema(
  productResponseSchema,
);
```

### 5. Exported TypeScript types

Always export inferred types at the bottom of the file — this is what consuming code imports.

```ts
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsPaginatedResponse = z.infer<
  typeof productsPaginatedResponseSchema
>;
```

---

## Complete example: `src/products.ts`

```ts
import { z } from "zod";
import {
  nameMin2Schema,
  nonEmptyStringSchema,
  nonNegativeIntSchema,
  paginatedResponseSchema,
  paginationLimitSchema,
  paginationPageSchema,
  uuidSchema,
} from "./shared.schema";

// ── Query ─────────────────────────────────────────────────────────────────────

export const productQuerySchema = z.object({
  page: paginationPageSchema,
  limit: paginationLimitSchema,
  search: z.string().optional(),
  categoryId: uuidSchema.optional(),
});

// ── Inputs ────────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: nameMin2Schema.max(120, "Name cannot exceed 120 characters"),
  description: z.string().max(2000).optional(),
  price: z.number().nonnegative("Price must be ≥ 0"),
  stock: nonNegativeIntSchema.default(0),
  categoryId: uuidSchema.optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ── Responses ─────────────────────────────────────────────────────────────────

export const productResponseSchema = z.object({
  id: uuidSchema,
  name: nonEmptyStringSchema,
  description: z.string().nullable(),
  price: z.number().nonnegative(),
  stock: nonNegativeIntSchema,
  categoryId: uuidSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const productsPaginatedResponseSchema = paginatedResponseSchema(
  productResponseSchema,
);

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsPaginatedResponse = z.infer<
  typeof productsPaginatedResponseSchema
>;
```

---

## Wiring the export in `package.json`

After creating `src/<domain>.ts`, add a new entry to the `"exports"` map in `packages/validators/package.json`:

```json
"./products": {
  "require": "./dist/products.js",
  "import": "./dist/products.js",
  "types": "./src/products.ts",
  "default": "./dist/products.js"
}
```

Pattern: `"./<domain>"` → `"./dist/<domain>.js"` (compiled) and `"./src/<domain>.ts"` (types).

**No other file needs to change.** The barrel `src/index.ts` is not required to re-export domain files; consumers import directly from the subpath.

---

## How these schemas are consumed

### NestJS controller — request validation

Use `ZodValidationPipe` (or equivalent) with the Zod schema as the DTO:

```ts
import { createProductSchema, CreateProductInput } from "@repo/validators/products";

@Post()
async create(
  @Body(new ZodValidationPipe(createProductSchema)) body: CreateProductInput,
) { … }
```

Query params follow the same pattern with `productQuerySchema`.

### NestJS service — response parsing

Parse DB rows through the response schema before returning:

```ts
import {
  productResponseSchema,
  ProductResponse,
} from "@repo/validators/products";

const parsed: ProductResponse = productResponseSchema.parse(dbRow);
```

### Frontend (Next.js)

Import types for form validation or API response typing:

```ts
import type {
  CreateProductInput,
  ProductResponse,
} from "@repo/validators/products";
```

---

## Checklist for a new domain

- [ ] Create `packages/validators/src/<domain>.ts`
- [ ] Import shared primitives from `./shared.schema`
- [ ] Define response schema(s)
- [ ] Define create input schema
- [ ] Define update input schema (use `.partial()`)
- [ ] Define query/pagination schema if the domain has a list endpoint
- [ ] Build paginated response schema via `paginatedResponseSchema(...)` if needed
- [ ] Export all `z.infer<...>` types at the bottom
- [ ] Add the `"./<domain>"` entry to `packages/validators/package.json` exports
- [ ] Run `pnpm --filter @repo/validators build` to verify compilation
