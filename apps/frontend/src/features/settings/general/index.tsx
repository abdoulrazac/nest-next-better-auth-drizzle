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
import { CheckIcon } from "@/lib/icons";
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
                  <Icon icon={CheckIcon} size={16} className="mr-2" />
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
                  <Icon icon={CheckIcon} size={16} className="mr-2" />
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
