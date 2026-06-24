---
name: nextjs-api-hooks
description: Create React Query hooks for API integration using the @hey-api/client-fetch generated SDK from @repo/api-client. Covers useQuery for lists/detail and useMutation for create/update/delete with typed request params/bodies, cache invalidation, and toast feedback. Use when building data fetching hooks for any feature in this Next.js project.
---

# Next.js API Hooks

## Stack

- **TanStack Query v5** (`@tanstack/react-query`)
- **@repo/api-client** — OpenAPI-generated typed SDK via `@hey-api/openapi-ts` with native `operations.nesting` (no custom wrapper script)
- **Sonner** — toast notifications

## The Generated SDK

After `pnpm --filter @repo/api-client generate` (or `pnpm generate` from repo root), the package exports a **namespaced client** — `apiClient.v1.<name>` for versioned NestJS endpoints and `apiClient.auth.<name>` for Better Auth endpoints. Import from `@/lib/api` (which re-exports `@repo/api-client`):

```ts
// Namespaced pattern (preferred):
//   apiClient.v1.usersFindAll(...)   → from UsersController @ V1
//   apiClient.auth.createUser(...)    → Better Auth admin create-user
import { apiClient } from "@/lib/api";
```

### Naming convention

The `@hey-api/sdk` plugin with `operations.nesting` in `openapi-ts.config.ts`
generates the `V1` and `Auth` classes natively — no custom wrapper script.
The nesting function maps `operation.operationId` to namespace segments:

| OpenAPI operationId                 | Namespaced call                         |
| ----------------------------------- | --------------------------------------- |
| `UsersController_findAll_v1`        | `apiClient.v1.usersFindAll(...)`        |
| `UsersController_update_v1`         | `apiClient.v1.usersUpdate(...)`         |
| `NotificationsController_remove_v1` | `apiClient.v1.notificationsRemove(...)` |
| `HealthController_check`            | `apiClient.v1.healthCheck(...)`         |
| `createUser`                        | `apiClient.auth.createUser(...)`        |
| `removeUser`                        | `apiClient.auth.removeUser(...)`        |
| `changePassword`                    | `apiClient.auth.changePassword(...)`    |
| `getApiAuthCallbackById`            | `apiClient.auth.getCallbackById(...)`   |

> **Never** hand-write URL strings. The generated functions bake in the correct
> URL (including the `/api` global prefix), HTTP method, security scheme, and
> typed `path` / `query` / `body` parameters. That is the end-to-end typesafety.

## Call Shape (generated functions)

Every generated function takes a single `options` object and returns
`{ data, error, response, request }` (a Promise). It does **not** throw by
default — throw on `error` so React Query never receives `undefined`:

```ts
import { apiClient } from "@/lib/api";

// GET with query params
const { data, error } = await apiClient.v1.usersFindAll({
  query: { page: 1, limit: 20, search: "john" },
});
if (error) throw error;
return data;

// GET with path param
const { data, error } = await apiClient.v1.usersFindOne({
  path: { id: "..." },
});

// PATCH with path + body
const { data, error } = await apiClient.v1.usersUpdate({
  path: { id },
  body: { name: "Jane", role: "admin" },
});

// POST (create) — Better Auth admin endpoint
const { data, error } = await apiClient.auth.createUser({
  body: { name, email, role },
});

// DELETE — Better Auth admin endpoint
const { data, error } = await apiClient.auth.removeUser({
  body: { userId: id },
});
```

### Raw client fallback

If no generated method exists yet, the raw `client` is exported too — but
prefer generating the SDK so calls stay typed:

```ts
import { client } from "@/lib/api";
const { data, error } = await client.get({
  url: "/api/v1/accounts/users",
  query: { page: 1, limit: 20 },
});
```

> Note the call shape: `client.get({ url, query, body })` — a single object.
> NOT `client.get(url, { params })`.
> `apiClient` is the SDK class instance (has `.v1.*` / `.auth.*` methods);
> `client` is the raw hey-api client (has `.get` / `.post` / `.setConfig`).

## Response ↔ validator types

The generated response types use ISO **strings** for dates (what the API
returns). `@repo/validators/*` schemas infer **`Date`** for date fields. To keep
the codebase convention (validators = domain types) while staying typed on the
request side, bridge the response with `as unknown as`:

```ts
return data as unknown as UsersPaginatedResponse;
```

## Query Keys Convention

Use an object-based query key factory per resource:

```ts
export const userKeys = {
  all: ["users"] as const,
  list: (params?: object) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};
```

## List Hook

```ts
export function useListUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.usersFindAll({
        // map the UI's `pageSize` to the API's `limit`
        query: {
          page: params?.page,
          limit: params?.pageSize,
          search: params?.search,
        },
      });
      if (error) throw error;
      return data as unknown as UsersPaginatedResponse;
    },
    staleTime: 30_000,
  });
}
```

## Detail Hook

```ts
export function useGetUser(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.usersFindOne({
        path: { id: id as string },
      });
      if (error) throw error;
      return data as unknown as User;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}
```

## Mutation Hooks

```ts
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const { data: res, error } = await apiClient.auth.createUser({
        body: data,
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Utilisateur créé");
    },
    onError: () => toast.error("Impossible de créer l'utilisateur"),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const { data: res, error } = await apiClient.v1.usersUpdate({
        path: { id },
        body: data,
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Utilisateur mis à jour");
    },
    onError: () => toast.error("Impossible de modifier l'utilisateur"),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: res, error } = await apiClient.auth.removeUser({
        body: { userId: id },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Utilisateur supprimé");
    },
    onError: () => toast.error("Impossible de supprimer l'utilisateur"),
  });
}
```

## Async Select Options Hook

For `ResourceSelect` with `fetchOptions`, use a dedicated lightweight hook:

```ts
export function useRoleOptions() {
  return async (search: string) => {
    const { data, error } = await apiClient.v1.rolesFindAll({});
    if (error) throw error;
    const roles = (data as unknown as Role[]) ?? [];
    return roles
      .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
      .map((r) => ({ label: r.name, value: r.id }));
  };
}
```

Then in the form:

```tsx
import { useRoleOptions } from "@/features/roles/hooks"

const fetchRoles = useRoleOptions()

<ResourceSelect fetchOptions={fetchRoles} ... />
```

> `ResourceSelect` handles debouncing internally via `useDebounce` from
> `@/hooks/use-debounce`. No need to debounce manually in the hook.

## Auth Headers

The `client` is configured with `baseUrl` in `@repo/api-client/src/index.ts`.
The browser sends the Better Auth session cookie automatically (same-origin via
the Next.js `/api/auth/*` rewrite). No manual Authorization header is needed in
the web app. (Mobile attaches the cookie via `authClient.getCookie()` — see
`apps/mobile/src/lib/api.ts`.)

## Notes

- `staleTime: 30_000` (30s) prevents over-fetching on navigation
- Invalidate `queryKey: userKeys.all` on mutations to refresh all list queries
- Use `queryClient.setQueryData(userKeys.detail(id), updatedUser)` for optimistic updates
- For WebSocket features, combine `useQuery` initial load + WebSocket events to update cache
- Icons: never import from `lucide-react` — use `Icon` from `@/components/ui/icon` + `@/lib/icons`
- After any backend API change, regenerate: `pnpm --filter @repo/api-client snapshot && pnpm --filter @repo/api-client generate`
