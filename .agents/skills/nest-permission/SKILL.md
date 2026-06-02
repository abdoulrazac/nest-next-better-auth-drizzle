---
name: nest-permission
description: Use when adding a new resource to the RBAC/permissions system in this NestJS project — e.g. when creating a new module that needs role-based access control, adding actions to an existing resource, or wiring up @UserHasPermission guards in a controller.
---

# Skill: Adding a Resource to the Permissions System

This project uses `better-auth` access control. All permissions are defined in a single file:

**`apps/backend/src/auth/permission.ts`**

---

## Step-by-step: Adding a New Resource

Use `products` as the example resource throughout.

### 1. Add the resource + actions to `statement`

`statement` is the source of truth for every resource and its allowed actions.

```ts
const statement = {
  // ... existing resources
  products: ["read", "write", "delete"], // add this line
} as const;
```

**Action naming conventions:**

| Action   | When to use                                                   |
| -------- | ------------------------------------------------------------- |
| `read`   | Fetch / list                                                  |
| `write`  | Create + update                                               |
| `delete` | Remove                                                        |
| `upload` | Binary/file ingestion (files resource)                        |
| `manage` | Full control over a sub-domain (e.g. settings, notifications) |

Prefer `read / write / delete` for standard CRUD. Use `upload` or `manage` only when the semantic differs meaningfully from `write`.

---

### 2. Add to `adminRole` (all actions)

Admin always gets every action on every resource.

```ts
const adminRole = ac.newRole({
  // ... existing resources
  products: ["read", "write", "delete"],
});
```

---

### 3. Add to `memberRole` and `viewerRole` (appropriate subset)

Apply least-privilege:

- **member** — can typically read + write, but not delete
- **viewer** — read-only

```ts
const memberRole = ac.newRole({
  // ... existing resources
  products: ["read", "write"],
});

const viewerRole = ac.newRole({
  // ... existing resources
  products: ["read"],
});
```

Omit the resource entirely from a role if that role should have no access at all.

---

### 4. Add to the `Permissions` export object

This object provides strongly-typed permission descriptors used in controllers and guards.

```ts
export const Permissions = {
  // ... existing resources
  products: {
    read: { products: ["read"] as string[] },
    write: { products: ["write"] as string[] },
    delete: { products: ["delete"] as string[] },
  },
};
```

> **Important:** The `as string[]` cast is **required** on every action array inside `Permissions`. Without it, TypeScript infers a readonly tuple type that is incompatible with the guard's expected signature.

The key name inside each descriptor object (`products`) **must exactly match** the key used in `statement`.

---

## Using permissions in a controller

Import `Permissions` and apply `@UserHasPermission` from `@thallesp/nestjs-better-auth`:

```ts
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { Permissions } from 'src/auth/permission';

@Controller('products')
export class ProductsController {
  @Get()
  @UserHasPermission({ permission: Permissions.products.read })
  findAll() { ... }

  @Post()
  @UserHasPermission({ permission: Permissions.products.write })
  create() { ... }

  @Delete(':id')
  @UserHasPermission({ permission: Permissions.products.delete })
  remove() { ... }
}
```

The guard checks the authenticated user's role against the access control rules defined in `permission.ts`.

---

## Checklist

- [ ] Resource + actions added to `statement`
- [ ] All actions added to `adminRole`
- [ ] Appropriate subset added to `memberRole`
- [ ] Appropriate subset added to `viewerRole` (usually read-only)
- [ ] Entry added to `Permissions` export with `as string[]` on every array
- [ ] `@UserHasPermission` applied to each controller endpoint that requires protection
