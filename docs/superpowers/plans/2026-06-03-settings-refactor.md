# Settings Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all broken tRPC imports in `settings/` — wire general + developers pages to real APIs, add placeholder pages for everything else, with all components in `features/settings/`.

**Architecture:** Feature components live in `apps/frontend/src/features/settings/` following the same pattern as `features/users/` and `features/roles/`. Route pages are minimal wrappers. Pages without backend show a shared `SettingsPlaceholder` component.

**Tech Stack:** Next.js 15, TanStack Query, `apiClient` from `@/lib/api`, `@hey-api/client-fetch`, `@repo/validators/settings`, `@repo/validators/webhooks`, ShadcnUI, HugeIcons via `@/lib/icons`, `better-auth` via `@/lib/auth-client`, Zod v4 + `zodResolver(schema as any) as any`.

---

## File Map

| Action  | Path                                                                             |
| ------- | -------------------------------------------------------------------------------- |
| Create  | `apps/frontend/src/features/settings/placeholder.tsx`                            |
| Create  | `apps/frontend/src/features/settings/general/schema.ts`                          |
| Create  | `apps/frontend/src/features/settings/general/hooks.ts`                           |
| Create  | `apps/frontend/src/features/settings/general/index.tsx`                          |
| Create  | `apps/frontend/src/features/settings/developers/hooks.ts`                        |
| Create  | `apps/frontend/src/features/settings/developers/api-keys-tab.tsx`                |
| Create  | `apps/frontend/src/features/settings/developers/webhooks-tab.tsx`                |
| Create  | `apps/frontend/src/features/settings/developers/index.tsx`                       |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/page.tsx`                 |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/general/page.tsx`         |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/company/page.tsx`         |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/fiscal-years/page.tsx`    |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/numbering/page.tsx`       |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/backup/page.tsx`          |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/data/page.tsx`            |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/reminders/page.tsx`       |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/subscription/page.tsx`    |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/dgi-integration/page.tsx` |
| Replace | `apps/frontend/src/app/(dashboard)/settings/(settings)/developers/page.tsx`      |

---

### Task 1: Create `features/settings/placeholder.tsx`

**Files:**

- Create: `apps/frontend/src/features/settings/placeholder.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/page-header";

interface SettingsPlaceholderProps {
  title: string;
  description: string;
}

export function SettingsPlaceholder({
  title,
  description,
}: SettingsPlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} variant="list" />
      <Card>
        <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Cette fonctionnalité sera disponible prochainement.
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Replace all 9 placeholder route pages**

Replace each file with its wrapper. Do all 9 in one go:

**`apps/frontend/src/app/(dashboard)/settings/(settings)/page.tsx`:**

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return (
    <SettingsPlaceholder
      title="Vue d'ensemble"
      description="Aperçu rapide de votre plateforme"
    />
  );
}
```

**`apps/frontend/src/app/(dashboard)/settings/(settings)/company/page.tsx`:**

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return (
    <SettingsPlaceholder
      title="Données entreprise"
      description="Informations légales et coordonnées de votre entreprise"
    />
  );
}
```

**`apps/frontend/src/app/(dashboard)/settings/(settings)/fiscal-years/page.tsx`:**

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return (
    <SettingsPlaceholder
      title="Exercices fiscaux"
      description="Gestion des exercices fiscaux"
    />
  );
}
```

**`apps/frontend/src/app/(dashboard)/settings/(settings)/numbering/page.tsx`:**

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return (
    <SettingsPlaceholder
      title="Numérotation"
      description="Séquences et numérotation automatique"
    />
  );
}
```

**`apps/frontend/src/app/(dashboard)/settings/(settings)/backup/page.tsx`:**

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return (
    <SettingsPlaceholder
      title="Sauvegarde"
      description="Sauvegardes automatiques de vos données"
    />
  );
}
```

**`apps/frontend/src/app/(dashboard)/settings/(settings)/data/page.tsx`:**

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return (
    <SettingsPlaceholder
      title="Gestion des données"
      description="Import et export de données"
    />
  );
}
```

**`apps/frontend/src/app/(dashboard)/settings/(settings)/reminders/page.tsx`:**

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return (
    <SettingsPlaceholder
      title="Relances"
      description="Configuration des rappels de paiement"
    />
  );
}
```

**`apps/frontend/src/app/(dashboard)/settings/(settings)/subscription/page.tsx`:**

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return (
    <SettingsPlaceholder title="Abonnement" description="Plan et facturation" />
  );
}
```

**`apps/frontend/src/app/(dashboard)/settings/(settings)/dgi-integration/page.tsx`:**

```tsx
import { SettingsPlaceholder } from "@/features/settings/placeholder";

export default function Page() {
  return (
    <SettingsPlaceholder
      title="Certification DGI"
      description="Connexion aux services fiscaux"
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/settings/placeholder.tsx \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/page.tsx" \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/company/page.tsx" \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/fiscal-years/page.tsx" \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/numbering/page.tsx" \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/backup/page.tsx" \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/data/page.tsx" \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/reminders/page.tsx" \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/subscription/page.tsx" \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/dgi-integration/page.tsx"
git commit -m "feat(settings): add SettingsPlaceholder + replace 9 stub pages"
```

---

### Task 2: Create `features/settings/general/schema.ts` and `hooks.ts`

**Files:**

- Create: `apps/frontend/src/features/settings/general/schema.ts`
- Create: `apps/frontend/src/features/settings/general/hooks.ts`

- [ ] **Step 1: Create `schema.ts`**

```ts
import { z } from "zod";

export const appSettingsFormSchema = z.object({
  appName: z.string().min(1, "Le nom est requis").max(100),
  supportEmail: z.string().email("Email invalide"),
  maintenanceMode: z.boolean(),
});

export const preferencesFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["fr", "en"]),
  timezone: z.string().min(1, "Le fuseau horaire est requis"),
});

export type AppSettingsFormValues = z.infer<typeof appSettingsFormSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;
```

- [ ] **Step 2: Create `hooks.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type {
  AppSettingsResponse,
  UpdateAppSettings,
  UserPreferencesResponse,
  UpdateUserPreferences,
} from "@repo/validators/settings";

export const settingsKeys = {
  app: ["settings", "app"] as const,
  preferences: ["settings", "preferences"] as const,
};

export function useGetAppSettings() {
  return useQuery({
    queryKey: settingsKeys.app,
    queryFn: async () => {
      const res = (await apiClient.get({ url: "/v1/settings/app" })) as any;
      return res.data as AppSettingsResponse;
    },
    staleTime: 60_000,
  });
}

export function useUpdateAppSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAppSettings) =>
      apiClient.patch({ url: "/v1/settings/app", body: data }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.app });
      toast.success("Paramètres enregistrés");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}

export function useGetPreferences() {
  return useQuery({
    queryKey: settingsKeys.preferences,
    queryFn: async () => {
      const res = (await apiClient.get({
        url: "/v1/settings/preferences",
      })) as any;
      return res.data as UserPreferencesResponse;
    },
    staleTime: 60_000,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserPreferences) =>
      apiClient.patch({
        url: "/v1/settings/preferences",
        body: data,
      }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.preferences });
      toast.success("Préférences enregistrées");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/settings/general/
git commit -m "feat(settings/general): add schema and hooks"
```

---

### Task 3: Create `features/settings/general/index.tsx`

**Files:**

- Create: `apps/frontend/src/features/settings/general/index.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import SingleSelect from "@/components/single-select";
import PageHeader from "@/components/page-header";
import { Icon } from "@/components/ui/icon";
import { SaveIcon } from "@/lib/icons";
import {
  appSettingsFormSchema,
  preferencesFormSchema,
  type AppSettingsFormValues,
  type PreferencesFormValues,
} from "./schema";
import {
  useGetAppSettings,
  useUpdateAppSettings,
  useGetPreferences,
  useUpdatePreferences,
} from "./hooks";

const THEME_OPTIONS = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "system", label: "Système" },
];

const LANGUAGE_OPTIONS = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

export function GeneralSettingsPage() {
  const { data: appSettings, isLoading: loadingApp } = useGetAppSettings();
  const { data: preferences, isLoading: loadingPrefs } = useGetPreferences();
  const updateApp = useUpdateAppSettings();
  const updatePrefs = useUpdatePreferences();

  const appForm = useForm<AppSettingsFormValues>({
    resolver: zodResolver(appSettingsFormSchema as any) as any,
    defaultValues: {
      appName: "",
      supportEmail: "",
      maintenanceMode: false,
    },
  });

  const prefsForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema as any) as any,
    defaultValues: { theme: "system", language: "fr", timezone: "" },
  });

  useEffect(() => {
    if (appSettings) {
      appForm.reset({
        appName: appSettings.appName ?? "",
        supportEmail: appSettings.supportEmail ?? "",
        maintenanceMode: appSettings.maintenanceMode ?? false,
      });
    }
  }, [appSettings]);

  useEffect(() => {
    if (preferences) {
      prefsForm.reset({
        theme: preferences.theme ?? "system",
        language: preferences.language ?? "fr",
        timezone: preferences.timezone ?? "",
      });
    }
  }, [preferences]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres généraux"
        description="Configurez les paramètres de l'application et vos préférences"
        variant="list"
      />

      {/* App settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de l'application</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingApp ? (
            <div className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-40" />
            </div>
          ) : (
            <form
              onSubmit={appForm.handleSubmit((v) => updateApp.mutate(v))}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="appName">Nom de l'application</Label>
                <Input
                  id="appName"
                  placeholder="Mon application"
                  {...appForm.register("appName")}
                />
                {appForm.formState.errors.appName && (
                  <p className="text-sm text-destructive">
                    {appForm.formState.errors.appName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="supportEmail">Email de support</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  placeholder="support@example.com"
                  {...appForm.register("supportEmail")}
                />
                {appForm.formState.errors.supportEmail && (
                  <p className="text-sm text-destructive">
                    {appForm.formState.errors.supportEmail.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Désactiver l'accès à l'application pour les utilisateurs
                  </p>
                </div>
                <Controller
                  control={appForm.control}
                  name="maintenanceMode"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={updateApp.isPending}>
                  <Icon icon={SaveIcon} size={16} className="mr-2" />
                  {updateApp.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* User preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Mes préférences</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPrefs ? (
            <div className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <form
              onSubmit={prefsForm.handleSubmit((v) => updatePrefs.mutate(v))}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>Thème</Label>
                <Controller
                  control={prefsForm.control}
                  name="theme"
                  render={({ field }) => (
                    <SingleSelect
                      options={THEME_OPTIONS}
                      value={field.value}
                      onValueChange={(v) =>
                        field.onChange(v as "light" | "dark" | "system")
                      }
                      placeholder="Sélectionner un thème"
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Langue</Label>
                <Controller
                  control={prefsForm.control}
                  name="language"
                  render={({ field }) => (
                    <SingleSelect
                      options={LANGUAGE_OPTIONS}
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as "fr" | "en")}
                      placeholder="Sélectionner une langue"
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Input
                  id="timezone"
                  placeholder="Europe/Paris"
                  {...prefsForm.register("timezone")}
                />
                {prefsForm.formState.errors.timezone && (
                  <p className="text-sm text-destructive">
                    {prefsForm.formState.errors.timezone.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={updatePrefs.isPending}>
                  <Icon icon={SaveIcon} size={16} className="mr-2" />
                  {updatePrefs.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Replace route page wrapper**

`apps/frontend/src/app/(dashboard)/settings/(settings)/general/page.tsx`:

```tsx
import { GeneralSettingsPage } from "@/features/settings/general";

export default function Page() {
  return <GeneralSettingsPage />;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/settings/general/index.tsx \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/general/page.tsx"
git commit -m "feat(settings/general): add GeneralSettingsPage wired to app + preferences API"
```

---

### Task 4: Create `features/settings/developers/hooks.ts`

**Files:**

- Create: `apps/frontend/src/features/settings/developers/hooks.ts`

Webhooks CRUD hooks wired to `GET/POST/PATCH/DELETE /v1/webhooks`.

- [ ] **Step 1: Create the file**

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type {
  WebhookResponse,
  WebhooksPaginatedResponse,
  CreateWebhookInput,
  UpdateWebhookInput,
} from "@repo/validators/webhooks";

export const webhookKeys = {
  all: ["webhooks"] as const,
  list: () => [...webhookKeys.all, "list"] as const,
  detail: (id: string) => [...webhookKeys.all, "detail", id] as const,
};

export function useListWebhooks() {
  return useQuery({
    queryKey: webhookKeys.list(),
    queryFn: async () => {
      const res = (await apiClient.get({ url: "/v1/webhooks" })) as any;
      return res.data as WebhooksPaginatedResponse;
    },
    staleTime: 30_000,
  });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWebhookInput) =>
      apiClient.post({ url: "/v1/webhooks", body: data }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.all });
      toast.success("Webhook créé");
    },
    onError: () => toast.error("Erreur lors de la création du webhook"),
  });
}

export function useUpdateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookInput }) =>
      apiClient.patch({ url: `/v1/webhooks/${id}`, body: data }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.all });
      toast.success("Webhook mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete({ url: `/v1/webhooks/${id}` }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.all });
      toast.success("Webhook supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/settings/developers/hooks.ts
git commit -m "feat(settings/developers): add webhook CRUD hooks"
```

---

### Task 5: Create `features/settings/developers/api-keys-tab.tsx`

**Files:**

- Create: `apps/frontend/src/features/settings/developers/api-keys-tab.tsx`

Port of the existing `api-keys-tab.tsx` with all broken imports fixed. Logic is unchanged.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import SingleSelect from "@/components/single-select";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/components/hooks/use-confirm-dialog";
import {
  AlertCircleIcon,
  CopyIcon,
  GlobeIcon,
  KeyIcon,
  PlusIcon,
  TrashIcon,
} from "@/lib/icons";
import { authClient, useSession } from "@/lib/auth-client";
import { env } from "@/env";

const EXPIRY_OPTIONS = [
  { label: "Jamais", value: "" },
  { label: "30 jours", value: String(60 * 60 * 24 * 30) },
  { label: "90 jours", value: String(60 * 60 * 24 * 90) },
  { label: "1 an", value: String(60 * 60 * 24 * 365) },
];

export function ApiKeysTab() {
  const { data: session } = useSession();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revealDialog, setRevealDialog] = useState<{
    key: string;
    name: string;
  } | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", expiresIn: "" });
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const result = await authClient.apiKey.list({
        query: {
          organizationId: session?.session?.activeOrganizationId!,
          limit: 10,
        },
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!session?.session?.activeOrganizationId,
  });

  const apiKeys = data?.apiKeys ?? [];

  const createMutation = useMutation({
    mutationFn: async (params: { name: string; expiresIn?: number }) => {
      const result = await authClient.apiKey.create({
        name: params.name,
        expiresIn: params.expiresIn,
        organizationId: session?.session?.activeOrganizationId!,
        metadata: {
          organizationId: session?.session?.activeOrganizationId!,
          userId: session?.session?.userId!,
          email: session?.user?.email ?? undefined,
          name: session?.user?.name ?? undefined,
        },
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (created) => {
      setCreateDialogOpen(false);
      setCreateForm({ name: "", expiresIn: "" });
      setRevealDialog({
        key: (created as any).key ?? "",
        name: (created as any).name ?? "Nouvelle clé",
      });
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e: Error) =>
      toast.error(e.message || "Erreur lors de la création de la clé"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const result = await authClient.apiKey.delete({ keyId });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Clé API supprimée");
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e: Error) =>
      toast.error(e.message || "Erreur lors de la suppression"),
  });

  const handleCreate = () => {
    if (!createForm.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    const expiresIn = createForm.expiresIn
      ? Number(createForm.expiresIn)
      : undefined;
    createMutation.mutate({ name: createForm.name, expiresIn });
  };

  const handleDelete = async (keyId: string, keyName: string) => {
    const ok = await confirm({
      ...confirmDialogPresets.delete,
      title: "Supprimer la clé API",
      description: `Voulez-vous vraiment supprimer la clé "${keyName}" ? Cette action est irréversible.`,
    });
    if (ok) deleteMutation.mutate(keyId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers");
  };

  const formatDate = (val: string | Date | null | undefined) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <TabsContent value="api-keys">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon icon={KeyIcon} size={20} />
                Clés API
              </CardTitle>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Icon icon={PlusIcon} size={16} />
                Nouvelle clé
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground animate-pulse">
                Chargement des clés API...
              </div>
            ) : isError ? (
              <div className="py-8 text-center">
                <p className="text-sm text-destructive mb-2">
                  {(error as Error)?.message ??
                    "Impossible de charger les clés API."}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon
                  icon={KeyIcon}
                  size={48}
                  className="mx-auto mb-4 opacity-30"
                />
                <p className="mb-2">Aucune clé API</p>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Créer une clé API
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Clé</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey: any) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">
                        {apiKey.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {apiKey.start
                            ? `${apiKey.start}••••••••`
                            : "••••••••••••••••••••"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            apiKey.enabled !== false ? "default" : "secondary"
                          }
                        >
                          {apiKey.enabled !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(apiKey.expiresAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Par{" "}
                        <span className="italic">
                          {apiKey.metadata?.["name"] ?? "—"}
                        </span>{" "}
                        le{" "}
                        <span className="italic">
                          {formatDate(apiKey.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            handleDelete(apiKey.id, apiKey.name ?? "cette clé")
                          }
                        >
                          <Icon icon={TrashIcon} size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon={GlobeIcon} size={20} />
              Documentation API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base URL</span>
                <span className="text-primary">
                  {`${env.NEXT_PUBLIC_APP_URL}/api/v1`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Authentification</span>
                <span className="text-primary">Bearer &lt;API_KEY&gt;</span>
              </div>
            </div>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
              <pre>{`curl -X GET ${env.NEXT_PUBLIC_APP_URL}/api/v1/users \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json"`}</pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer une clé API</DialogTitle>
            <DialogDescription>
              La clé ne sera affichée qu'une seule fois après la création.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Nom *</Label>
              <Input
                id="key-name"
                placeholder="Ma clé de production"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration</Label>
              <SingleSelect
                options={EXPIRY_OPTIONS}
                value={createForm.expiresIn}
                onValueChange={(v) =>
                  setCreateForm((p) => ({ ...p, expiresIn: v }))
                }
                placeholder="Sélectionner une durée"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal dialog */}
      <Dialog
        open={!!revealDialog}
        onOpenChange={(open) => !open && setRevealDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clé API créée</DialogTitle>
            <DialogDescription>
              Copiez votre clé maintenant. Elle ne sera plus affichée après la
              fermeture de cette fenêtre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <Icon
                icon={AlertCircleIcon}
                size={16}
                className="text-amber-600"
              />
              <AlertDescription className="text-amber-700">
                Conservez cette clé en lieu sûr. Elle ne peut pas être récupérée
                ultérieurement.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm break-all">
                {revealDialog?.key}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => copyToClipboard(revealDialog?.key ?? "")}
              >
                <Icon icon={CopyIcon} size={16} />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealDialog(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialogComponent />
    </TabsContent>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/settings/developers/api-keys-tab.tsx
git commit -m "feat(settings/developers): add ApiKeysTab with fixed imports"
```

---

### Task 6: Create `features/settings/developers/webhooks-tab.tsx`

**Files:**

- Create: `apps/frontend/src/features/settings/developers/webhooks-tab.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/components/hooks/use-confirm-dialog";
import { EditIcon, PlusIcon, TrashIcon, WebhookIcon } from "@/lib/icons";
import {
  useListWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
} from "./hooks";
import type { WebhookResponse } from "@repo/validators/webhooks";

const webhookFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  url: z.string().url("URL invalide"),
  events: z.string().min(1, "Au moins un événement requis"),
  secret: z.string().optional(),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

interface MutateWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: WebhookResponse | null;
}

function MutateWebhookDialog({
  open,
  onOpenChange,
  webhook,
}: MutateWebhookDialogProps) {
  const isEdit = !!webhook;
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema as any) as any,
    defaultValues: { name: "", url: "", events: "", secret: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: webhook?.name ?? "",
        url: webhook?.url ?? "",
        events: webhook?.events?.join(", ") ?? "",
        secret: "",
      });
    }
  }, [open, webhook, reset]);

  const isPending = createWebhook.isPending || updateWebhook.isPending;

  async function onSubmit(values: WebhookFormValues) {
    const events = values.events
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const payload = {
      name: values.name,
      url: values.url,
      events,
      ...(values.secret ? { secret: values.secret } : {}),
    };

    if (isEdit && webhook) {
      await updateWebhook.mutateAsync({ id: webhook.id, data: payload });
    } else {
      await createWebhook.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier le webhook" : "Nouveau webhook"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wh-name">Nom</Label>
            <Input
              id="wh-name"
              placeholder="Mon webhook"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-url">URL</Label>
            <Input
              id="wh-url"
              placeholder="https://example.com/webhook"
              {...register("url")}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-events">Événements</Label>
            <Input
              id="wh-events"
              placeholder="user.created, user.deleted"
              {...register("events")}
            />
            {errors.events && (
              <p className="text-sm text-destructive">
                {errors.events.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Séparés par des virgules
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-secret">
              Secret{" "}
              <span className="text-muted-foreground font-normal">
                (optionnel)
              </span>
            </Label>
            <Input
              id="wh-secret"
              type="password"
              placeholder="Min. 16 caractères"
              {...register("secret")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Enregistrement..."
                : isEdit
                  ? "Enregistrer"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function WebhooksTab() {
  const { data, isLoading } = useListWebhooks();
  const deleteWebhook = useDeleteWebhook();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WebhookResponse | null>(null);

  const webhooks = data?.items ?? [];

  const handleDelete = async (webhook: WebhookResponse) => {
    const ok = await confirm({
      ...confirmDialogPresets.delete,
      title: "Supprimer le webhook",
      description: `Voulez-vous vraiment supprimer "${webhook.name}" ? Cette action est irréversible.`,
    });
    if (ok) deleteWebhook.mutate(webhook.id);
  };

  return (
    <TabsContent value="webhooks">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon={WebhookIcon} size={20} />
              Webhooks
            </CardTitle>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditTarget(null);
                setDialogOpen(true);
              }}
            >
              <Icon icon={PlusIcon} size={16} />
              Nouveau webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">
              Chargement des webhooks...
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon
                icon={WebhookIcon}
                size={48}
                className="mx-auto mb-4 opacity-30"
              />
              <p className="mb-2">Aucun webhook configuré</p>
              <Button
                variant="outline"
                onClick={() => {
                  setEditTarget(null);
                  setDialogOpen(true);
                }}
              >
                Créer un webhook
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Événements</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((wh) => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-medium">{wh.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                      {wh.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {wh.events.slice(0, 2).map((e) => (
                          <Badge
                            key={e}
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {e}
                          </Badge>
                        ))}
                        {wh.events.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{wh.events.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={wh.active ? "default" : "secondary"}>
                        {wh.active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setEditTarget(wh);
                            setDialogOpen(true);
                          }}
                        >
                          <Icon icon={EditIcon} size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          disabled={deleteWebhook.isPending}
                          onClick={() => handleDelete(wh)}
                        >
                          <Icon icon={TrashIcon} size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MutateWebhookDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditTarget(null);
        }}
        webhook={editTarget}
      />

      <ConfirmDialogComponent />
    </TabsContent>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/settings/developers/webhooks-tab.tsx
git commit -m "feat(settings/developers): add WebhooksTab wired to /v1/webhooks"
```

---

### Task 7: Create `features/settings/developers/index.tsx` + replace route page

**Files:**

- Create: `apps/frontend/src/features/settings/developers/index.tsx`
- Replace: `apps/frontend/src/app/(dashboard)/settings/(settings)/developers/page.tsx`

- [ ] **Step 1: Create `index.tsx`**

```tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { KeyIcon, LinkIcon } from "@/lib/icons";
import PageHeader from "@/components/page-header";
import { ApiKeysTab } from "./api-keys-tab";
import { WebhooksTab } from "./webhooks-tab";

const tabs = [
  { value: "api-keys", label: "Clés API", icon: KeyIcon },
  { value: "webhooks", label: "Webhooks", icon: LinkIcon },
] as const;

export function DevelopersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Développeurs"
        description="Gérez vos clés API et webhooks"
        variant="list"
      />

      <Tabs defaultValue="api-keys" className="w-full space-y-4">
        <TabsList variant="line" className="flex w-full justify-start border-b">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="max-w-30 px-4 data-active:text-primary"
            >
              <Icon icon={tab.icon} size={16} className="mr-1" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <ApiKeysTab />
        <WebhooksTab />
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Replace route page**

`apps/frontend/src/app/(dashboard)/settings/(settings)/developers/page.tsx`:

```tsx
import { DevelopersPage } from "@/features/settings/developers";

export default function Page() {
  return <DevelopersPage />;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/settings/developers/index.tsx \
  "apps/frontend/src/app/(dashboard)/settings/(settings)/developers/page.tsx"
git commit -m "feat(settings/developers): add DevelopersPage wrapper"
```

---

### Task 8: Verify — run TypeScript check

- [ ] **Step 1: Clear Next.js cache and run tsc**

```bash
rm -rf apps/frontend/.next
cd apps/frontend && npx tsc --noEmit 2>&1 | grep -v node_modules | grep "error TS" | grep "features/settings\|settings/(settings)" | head -20
```

Expected: no errors in `features/settings/` or `settings/(settings)/` pages.

- [ ] **Step 2: Fix any errors found**

Common issues to look for:

- `useSession` import: exported as named from `@/lib/auth-client` → `import { useSession } from "@/lib/auth-client"`
- `SaveIcon` not in `@/lib/icons` — check and replace with `DownloadIcon` or `CheckIcon` if missing
- `SingleSelect` prop types — if `btnClassName` is required, add `btnClassName="w-full"` where needed

- [ ] **Step 3: Count total errors**

```bash
cd apps/frontend && npx tsc --noEmit 2>&1 | grep -v node_modules | grep -c "error TS"
```

Expected: 0 errors (all settings-related errors resolved).

- [ ] **Step 4: Commit any fixes**

```bash
git add apps/frontend/src/features/settings/
git commit -m "fix(settings): resolve TypeScript errors"
```
