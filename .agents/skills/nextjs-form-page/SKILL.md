---
name: nextjs-form-page
description: Create a standalone form page (not dialog) for settings, profile, or complex multi-section forms. Uses FormSection for grouping, ResourceSelect for relational fields, React Hook Form + Zod, and TanStack Query mutation. Use when building settings pages, profile pages, or any full-page form in this Next.js project.
---

# Next.js Form Page

## Stack

- **Form fields** — `FormTextField`, `FormTextareaField`, `FormSwitchField`, `FormCheckboxField`, `FormSelectField`, `FormDateField` de `@/components/form`
- **Form actions** — `FormActions variant="page"` de `@/components/form`
- **PageHeader** (`@/components/page-header`) — titre + description + bouton retour
- **BasePage** (`@/components/layout/base-page`) — wrapper dashboard
- **Schema** — import depuis `@repo/validators/<entity>` (JAMAIS de schema local)
- **API** — `client` de `@repo/api-client`
- **Icons** — toujours via `@/lib/icons`. Jamais `lucide-react`.
- **React Hook Form** + **Zod** ; workaround Zod v4 : `zodResolver(schema as any) as any`
- **TanStack Query** `useMutation` + `useQuery`
- **Sonner** `toast` pour les feedbacks (en français)

## Règle fondamentale — Schemas

**Les schemas de formulaire proviennent toujours de `@repo/validators/`.**
Ne jamais définir un schema Zod local dans un fichier feature.

```ts
// ✅ Correct
import {
  updateProfileInputSchema,
  type UpdateProfileInput,
} from "@repo/validators/profiles";

// ❌ Interdit
const profileSchema = z.object({ name: z.string() });
```

## Quick Start

### Formulaire standalone (`features/settings/profile-form.tsx`)

```tsx
"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  FormTextField,
  FormTextareaField,
  FormSwitchField,
  FormSelectField,
  FormActions,
} from "@/components/form";
import {
  updateProfileInputSchema,
  type UpdateProfileInput,
} from "@repo/validators/profiles";
import { useGetProfile, useUpdateProfile } from "./hooks";

export function ProfileForm() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileInputSchema as any) as any,
    defaultValues: {
      name: "",
      bio: "",
      timezone: "",
      emailNotifications: true,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? "",
        bio: profile.bio ?? "",
        timezone: profile.timezone ?? "",
        emailNotifications: profile.emailNotifications ?? true,
      });
    }
  }, [profile, form]);

  const onSubmit = (values: UpdateProfileInput) => updateProfile.mutate(values);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl"
    >
      <FormTextField
        form={form}
        name="name"
        label="Nom affiché"
        required
        disabled={updateProfile.isPending}
      />
      <FormTextareaField
        form={form}
        name="bio"
        label="Biographie"
        rows={3}
        description="Maximum 160 caractères."
        disabled={updateProfile.isPending}
      />
      <FormSelectField
        form={form}
        name="timezone"
        label="Fuseau horaire"
        variant="single"
        options={TIMEZONE_OPTIONS}
        disabled={updateProfile.isPending}
      />
      <FormSwitchField
        form={form}
        name="emailNotifications"
        label="Notifications par email"
        description="Recevoir les mises à jour par email."
        disabled={updateProfile.isPending}
      />
      <FormActions
        variant="page"
        isLoading={updateProfile.isPending}
        disabled={updateProfile.isPending}
        submitLabel="Enregistrer les modifications"
        submitLoadingLabel="Enregistrement..."
        onCancel={() => router.back()}
      />
    </form>
  );
}
```

### Page avec onglets (`features/settings/index.tsx`)

```tsx
"use client";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasePage } from "@/components/layout/base-page";
import PageHeader from "@/components/page-header";
import { ProfileForm } from "./profile-form";
import { NotificationsForm } from "./notifications-form";

export function SettingsPage() {
  return (
    <BasePage breadcrumbs={[{ title: "Paramètres", url: "/settings" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Paramètres"
          description="Gérez vos paramètres de compte."
        />
        <Separator />
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsForm />
          </TabsContent>
        </Tabs>
      </div>
    </BasePage>
  );
}
```

### Page create/edit standalone (ex. `/roles/new`, `/roles/:id/edit`)

```tsx
"use client";
import { BasePage } from "@/components/layout/base-page";
import PageHeader from "@/components/page-header";
import { RoleForm } from "@/features/roles/role-form";

export default function RoleCreatePage() {
  return (
    <BasePage
      breadcrumbs={[
        { title: "Rôles", url: "/account/roles" },
        { title: "Nouveau rôle" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Nouveau rôle"
          variant="create"
          backNavigation={{ href: "/account/roles", label: "Rôles" }}
        />
        <RoleForm />
      </div>
    </BasePage>
  );
}
```

## Notes

- Pas de `<Form>` ShadcnUI wrapper — les composants `@/components/form` utilisent `Controller` en interne
- Charger les données existantes avec `useQuery` → `form.reset()` dans `useEffect`
- `FormActions variant="page"` place le bouton Enregistrer à gauche
- Limiter la largeur du formulaire à `max-w-2xl` pour la lisibilité
- Labels, toasts, placeholders **en français**
- Zod v4 : `zodResolver(schema as any) as any`
- `onCancel` sur FormActions : `() => router.back()` ou `() => router.push("/module/entities")`
