---
name: nextjs-form-page
description: Create a standalone form page (not dialog) for settings, profile, or complex multi-section forms. Uses FormSection for grouping, ResourceSelect for relational fields, React Hook Form + Zod, and TanStack Query mutation. Use when building settings pages, profile pages, or any full-page form in this Next.js project.
---

# Next.js Form Page

## Stack

- **ShadcnUI** `Form`, `Input`, `Button`, `Separator`, `Switch`, `Textarea`, `Tabs`
- **FormSection** (`@/components/form-section`) — visual section grouping with title + optional description
- **ResourceSelect** (`@/components/ui/resource-select`) — for all select/combobox fields
- **PageHeader** (`@/components/page-header`) — page title + description + optional action button
- **Icons** — always use `Icon` from `@/components/ui/icon` + barrel from `@/lib/icons`. Never use `lucide-react`.
- **React Hook Form** + **Zod**
- **TanStack Query** `useMutation` + `useQuery` for load + save

## Quick Start

### Settings form with sections (`features/settings/profile-form.tsx`)

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormSection } from "@/components/form-section";
import { ResourceSelect } from "@/components/ui/resource-select";
import { useGetSettings, useUpdateSettings } from "./hooks";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(160).optional(),
  timezone: z.string().optional(),
  emailNotifications: z.boolean().default(true),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      timezone: "",
      emailNotifications: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        name: settings.name ?? "",
        bio: settings.bio ?? "",
        timezone: settings.timezone ?? "",
        emailNotifications: settings.emailNotifications ?? true,
      });
    }
  }, [settings, form]);

  const onSubmit = (values: ProfileValues) => updateSettings.mutate(values);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl"
      >
        <FormSection
          title="Identity"
          description="This is how others see you on the platform."
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormDescription>Max 160 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Preferences">
          {/* Async select */}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <ResourceSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={TIMEZONE_OPTIONS}
                    placeholder="Select timezone..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <FormLabel>Email notifications</FormLabel>
                  <FormDescription>Receive updates via email.</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </FormSection>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save changes"}
          </Button>
          {form.formState.isDirty && (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          )}
        </div>
      </form>
    </Form>
  );
}
```

## Settings page with tabs (`features/settings/index.tsx`)

```tsx
"use client";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "./profile-form";
import { AppSettingsForm } from "./app-settings-form";
import { NotificationsForm } from "./notifications-form";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage account and application settings."
      />
      <Separator />
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="app">Application</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="app">
          <AppSettingsForm />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Sidebar-nav layout (shadcn-admin style)

For settings with many sections:

```tsx
<div className="flex gap-8">
  <nav className="w-48 shrink-0 space-y-1">
    {sections.map((s) => (
      <button
        key={s.id}
        onClick={() => setActive(s.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
          active === s.id
            ? "bg-muted font-medium"
            : "text-muted-foreground hover:bg-muted/50",
        )}
      >
        <Icon icon={s.icon} size={15} />
        {s.label}
      </button>
    ))}
  </nav>
  <div className="flex-1 max-w-2xl">{renderSection(active)}</div>
</div>
```

## FormSection API

```tsx
import { FormSection } from "@/components/form-section"

// With title only
<FormSection title="Basic info">
  {/* fields */}
</FormSection>

// With description and separator
<FormSection title="Danger zone" description="Irreversible actions." variant="danger">
  {/* fields */}
</FormSection>
```

## Notes

- Load existing data with `useQuery`, populate form with `form.reset()` in `useEffect`
- Use `form.formState.isDirty` to show "Unsaved changes" indicator
- `FormSection` replaces raw `<Card>` wrappers — cleaner hierarchy
- Use `ResourceSelect` for relational fields (never raw ShadcnUI `Select`)
- Cap form width to `max-w-2xl` for readability on wide screens
