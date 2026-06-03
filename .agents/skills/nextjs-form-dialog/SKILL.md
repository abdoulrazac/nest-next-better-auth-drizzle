---
name: nextjs-form-dialog
description: Create a form inside a ShadcnUI Dialog for create or edit operations. Uses React Hook Form + Zod validation, TanStack Query mutation, Sonner toast on success/error, and loading state. Use when building create/edit/action dialogs for any resource in this Next.js project.
---

# Next.js Form Dialog

## Stack

- **ShadcnUI** `Dialog`, `Form`, `Input`, `Button`, `Textarea`, `Switch`
- **FormSection** (`@/components/form-section`) — groups related fields with a heading
- **ResourceSelect** (`@/components/ui/resource-select`) — for all select/combobox fields (single, multiple, async)
- **ConfirmDialog** (`@/components/confirm-dialog`) — for destructive confirmations, never use `AlertDialog` directly
- **Icons** — always use `Icon` from `@/components/ui/icon` + barrel from `@/lib/icons`. Never use `lucide-react`.
- **React Hook Form** + **Zod** for validation
- **TanStack Query** `useMutation` for API calls
- **Sonner** `toast` for feedback

## File Structure

```
features/<name>/
  mutate-dialog.tsx    ← Unified create+edit dialog (preferred)
  schema.ts            ← Zod schemas
  hooks.ts             ← useMutation hooks
```

## Quick Start

### 1. Schema (`schema.ts`)

```ts
import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  roleId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
```

### 2. Mutation hooks (`hooks.ts`)

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserFormValues) =>
      apiClient.post("/v1/accounts/users", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create user"),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormValues> }) =>
      apiClient.patch(`/v1/accounts/users/${id}`, { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to update user"),
  });
}
```

### 3. Unified Dialog (`mutate-dialog.tsx`)

```tsx
"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/form-section";
import { ResourceSelect } from "@/components/ui/resource-select";
import { userFormSchema, UserFormValues } from "./schema";
import { useCreateUser, useUpdateUser } from "./hooks";

interface MutateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null; // null/undefined = create mode, User = edit mode
}

export function MutateUserDialog({
  open,
  onOpenChange,
  user,
}: MutateUserDialogProps) {
  const isEdit = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isPending = createUser.isPending || updateUser.isPending;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: "", email: "", roleId: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        roleId: user.roleId ?? "",
      });
    } else {
      form.reset({ name: "", email: "", roleId: "" });
    }
  }, [user, form]);

  const onSubmit = async (values: UserFormValues) => {
    if (isEdit) {
      await updateUser.mutateAsync({ id: user.id, data: values });
    } else {
      await createUser.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Basic info">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Access">
              {/* Single async select */}
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <ResourceSelect
                        value={field.value}
                        onChange={field.onChange}
                        fetchOptions={async (search) => {
                          const res = await apiClient.get("/v1/roles", {
                            params: { search },
                          });
                          return res.items.map((r) => ({
                            label: r.name,
                            value: r.id,
                          }));
                        }}
                        placeholder="Select a role..."
                        addAction={{
                          label: "New role",
                          onClick: () => {
                            /* open roles dialog */
                          },
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEdit ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## ResourceSelect Patterns

```tsx
// Static single select
<ResourceSelect
  value={field.value}
  onChange={field.onChange}
  options={[
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
  ]}
/>

// Async single select with add button
<ResourceSelect
  value={field.value}
  onChange={field.onChange}
  fetchOptions={async (search) => {
    const res = await apiClient.get("/v1/roles", { params: { search } })
    return res.items.map((r) => ({ label: r.name, value: r.id }))
  }}
  addAction={{ label: "New role", onClick: openNewRoleDialog }}
/>

// Multi-select (async)
<ResourceSelect
  multiple
  value={field.value}
  onChange={field.onChange}
  fetchOptions={async (search) => fetchTagOptions(search)}
  placeholder="Select tags..."
/>

// Creatable (user can type + create new option)
<ResourceSelect
  creatable
  onCreate={async (label) => {
    await createTag({ name: label })
    // after creation, the parent should refetch options
  }}
  fetchOptions={fetchTagOptions}
/>
```

## ConfirmDialog Pattern (delete from row actions)

Import and use `ConfirmDialog` in the parent page — **never** inline `AlertDialog` inside dialogs:

```tsx
import { ConfirmDialog } from "@/components/confirm-dialog"

// In parent page state:
const [deleteId, setDeleteId] = useState<string | null>(null)

// At bottom of JSX:
<ConfirmDialog
  open={!!deleteId}
  onOpenChange={(open) => !open && setDeleteId(null)}
  title="Delete user?"
  description="This action cannot be undone."
  onConfirm={() => { deleteUser.mutate(deleteId!); setDeleteId(null) }}
  isPending={deleteUser.isPending}
/>
```

## Notes

- Use `useEffect` + `form.reset()` to sync edit values when `user` prop changes
- Close dialog `onOpenChange(false)` only on success — use `mutateAsync` (not `mutate`)
- Dialog width: `sm:max-w-[480px]` for simple, `sm:max-w-[600px]` for complex multi-section
- Wrap related fields in `<FormSection title="...">` instead of raw `<div>`
- Use `ResourceSelect` for every select/combobox — never raw ShadcnUI `Select` for relational data
