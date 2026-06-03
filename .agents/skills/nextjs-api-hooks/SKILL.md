---
name: nextjs-api-hooks
description: Create React Query hooks for API integration using @hey-api/client-fetch and the @repo/api-client generated SDK. Covers useQuery for lists/detail and useMutation for create/update/delete with cache invalidation and toast feedback. Use when building data fetching hooks for any feature in this Next.js project.
---

# Next.js API Hooks

## Stack

- **TanStack Query v5** (`@tanstack/react-query`)
- **@repo/api-client** — generated SDK wrapping `@hey-api/client-fetch`
- **Sonner** — toast notifications

## Import Pattern

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// Import generated SDK functions (after pnpm generate):
import {
  getUsers,
  getUser,
  updateUser,
  createUser,
  deleteUser,
} from "@repo/api-client";
// OR use apiClient directly if SDK not generated yet:
import { apiClient } from "@/lib/api";
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
interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export function useListUsers(params?: ListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => apiClient.get("/v1/accounts/users", { params }),
    staleTime: 30_000,
  });
}
```

## Detail Hook

```ts
export function useGetUser(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => apiClient.get(`/v1/accounts/users/${id}`),
    enabled: !!id && (options?.enabled ?? true),
  });
}
```

## Mutation Hooks

```ts
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) =>
      apiClient.post("/v1/accounts/users", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create user"),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      apiClient.patch(`/v1/accounts/users/${id}`, { body: data }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success("User updated");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to update user"),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/accounts/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User deleted");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to delete user"),
  });
}
```

## Direct apiClient Usage

The `apiClient` from `@/lib/api` is a pre-configured `@hey-api/client-fetch` instance:

```ts
// GET with query params
const data = await apiClient.get("/v1/accounts/users", {
  params: { page: 1, pageSize: 20, search: "john" },
});

// POST with body
const user = await apiClient.post("/v1/accounts/users", {
  body: { name: "John", email: "john@example.com" },
});

// PATCH
await apiClient.patch(`/v1/accounts/users/${id}`, { body: { name: "Jane" } });

// DELETE
await apiClient.delete(`/v1/accounts/users/${id}`);
```

## Auth Headers

The `apiClient` instance must include the auth token. Update `lib/api.ts` if needed:

```ts
import { createClient } from "@hey-api/client-fetch";
import { authClient } from "./auth-client";

export const apiClient = createClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  headers: () => {
    const session = authClient.getSession();
    return session?.data?.session?.token
      ? { Authorization: `Bearer ${session.data.session.token}` }
      : {};
  },
});
```

## Paginated Response Pattern

Backend returns `{ items: T[], total: number, page: number, pageSize: number }`:

```ts
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

## Async Select Options Hook

For `ResourceSelect` with `fetchOptions`, use a dedicated lightweight hook:

```ts
export function useRoleOptions() {
  return async (search: string) => {
    const res = await apiClient.get("/v1/roles", {
      params: { search, pageSize: 20 },
    });
    return res.items.map((r) => ({ label: r.name, value: r.id }));
  };
}
```

Then in the form:

```tsx
import { useRoleOptions } from "@/features/roles/hooks"

const fetchRoles = useRoleOptions()

<ResourceSelect fetchOptions={fetchRoles} ... />
```

> `ResourceSelect` handles debouncing internally via `useDebounce` from `@/hooks/use-debounce`.
> No need to debounce manually in the hook.

## Notes

- `staleTime: 30_000` (30s) prevents over-fetching on navigation
- Invalidate `queryKey: userKeys.all` on mutations to refresh all list queries
- Use `queryClient.setQueryData(userKeys.detail(id), updatedUser)` for optimistic updates
- For WebSocket features, combine `useQuery` initial load + WebSocket events to update cache
- Icons: never import from `lucide-react` — use `Icon` from `@/components/ui/icon` + `@/lib/icons`
