---
name: nextjs-form-dialog
description: Create a form inside a ShadcnUI Dialog for create or edit operations. Uses React Hook Form + Zod validation, TanStack Query mutation, Sonner toast on success/error, and loading state. Use when building create/edit/action dialogs for any resource in this Next.js project.
---

# Next.js Form Dialog

## Stack

- **Form fields** — `FormTextField`, `FormTextareaField`, `FormSwitchField`, `FormCheckboxField`, `FormSelectField`, `FormDateField` de `@/components/form`
- **Form actions** — `FormActions variant="dialog"` de `@/components/form`
- **Form sections** — `FormSection` de `@/components/form`
- **ShadcnUI** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- **Schema** — import depuis `@repo/validators/<entity>` (JAMAIS de schema local)
- **API** — `apiClient.v1.*` / `apiClient.auth.*` de `@repo/api-client` (import via `@/lib/api`)
- **Icons** — toujours via `@/lib/icons`. Jamais `lucide-react`.
- **React Hook Form** + **Zod** ; workaround Zod v4 : `zodResolver(schema as any) as any`
- **TanStack Query** `useMutation`
- **Sonner** `toast` pour les feedbacks (en français)

## Structure de fichiers

```
features/<entity>/
  mutate-dialog.tsx    ← Dialog unifié create+edit
  hooks.ts             ← useMutation hooks (ou dans hooks.ts centralisé)
  types.ts             ← types depuis @repo/validators
```

## Règle fondamentale — Schemas

**Les schemas de formulaire proviennent toujours de `@repo/validators/`.**
Ne jamais définir un schema Zod local dans `schema.ts` ou dans le composant.

```ts
// ✅ Correct
import {
  createUserInputSchema,
  type CreateUserInput,
} from "@repo/validators/users";

// ❌ Interdit
const userFormSchema = z.object({ name: z.string() });
```

## Quick Start

### 1. Mutations dans `hooks.ts`

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { CreateUserInput, UpdateUserInput } from "@repo/validators/users";

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const { data: res, error } = await apiClient.auth.createUser({
        body: data,
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur créé");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
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
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}
```

### 2. Dialog unifié (`mutate-dialog.tsx`)

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
} from "@/components/ui/dialog";
import { FormTextField, FormSelectField, FormActions } from "@/components/form";
import {
  createUserInputSchema,
  type CreateUserInput,
} from "@repo/validators/users";
import { useCreateUser, useUpdateUser } from "./hooks";
import type { User } from "./types";

interface MutateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null; // null/undefined = create, User = edit
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

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserInputSchema as any) as any,
    defaultValues: { name: "", email: "", role: "member" },
  });

  useEffect(() => {
    form.reset(
      user
        ? { name: user.name, email: user.email, role: user.role }
        : { name: "", email: "", role: "member" },
    );
  }, [user, form]);

  const onSubmit = async (values: CreateUserInput) => {
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
          <DialogTitle>
            {isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormTextField
            form={form}
            name="name"
            label="Nom"
            required
            disabled={isPending}
          />
          <FormTextField
            form={form}
            name="email"
            label="Email"
            type="email"
            required
            disabled={isEdit || isPending}
            description={
              isEdit ? "L'email ne peut pas être modifié." : undefined
            }
          />
          <FormSelectField
            form={form}
            name="role"
            label="Rôle"
            variant="single"
            disabled={isPending}
            options={[
              { value: "admin", label: "Administrateur" },
              { value: "member", label: "Membre" },
              { value: "viewer", label: "Lecteur" },
            ]}
          />
          <FormActions
            variant="dialog"
            isLoading={isPending}
            disabled={isPending}
            submitLabel={isEdit ? "Mettre à jour" : "Créer"}
            submitLoadingLabel={isEdit ? "Mise à jour..." : "Création..."}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Notes

- Toujours `mutateAsync` (pas `mutate`) pour fermer le dialog uniquement en cas de succès
- Pas de `<Form>` ShadcnUI wrapper — les composants `@/components/form` utilisent `Controller` en interne
- Dialog width : `sm:max-w-[480px]` simple, `sm:max-w-[600px]` multi-section
- `useEffect` + `form.reset()` pour synchroniser les valeurs en mode édition
- Labels, toasts, placeholders **en français**
- `FormActions variant="dialog"` aligne les boutons à droite
- Zod v4 : `zodResolver(schema as any) as any`
