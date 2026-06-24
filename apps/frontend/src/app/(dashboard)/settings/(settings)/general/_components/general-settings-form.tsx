// @ts-nocheck
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared";
import SingleSelect from "@/components/single-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  updateGeneralSettingsSchema,
  type UpdateGeneralSettingsInput,
} from "@/server/api/settings/schemas/general.schema";
import { api } from "@/trpc/react";
import { SaveIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

const currencyOptions = [
  { value: "XOF", label: "Franc CFA (XOF)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "Dollar américain ($)" },
  { value: "GBP", label: "Livre sterling (£)" },
  { value: "CAD", label: "Dollar canadien ($)" },
  { value: "CHF", label: "Franc suisse (CHF)" },
];

const languageOptions = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

const timezoneOptions = [
  { value: "Africa/Ouagadougou", label: "Africa/Ouagadougou (GMT+0)" },
  { value: "Africa/Porto-Novo", label: "Africa/Porto-Novo (GMT+1)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (GMT+1)" },
  { value: "Europe/Paris", label: "Europe/Paris (GMT+1)" },
  { value: "Europe/London", label: "Europe/London (GMT+0)" },
  { value: "America/New_York", label: "America/New_York (GMT-5)" },
];

const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "31/12/2024 (DD/MM/YYYY)" },
  { value: "MM/DD/YYYY", label: "12/31/2024 (MM/DD/YYYY)" },
  { value: "YYYY-MM-DD", label: "2024-12-31 (ISO)" },
];

const timeFormatOptions = [
  { value: "HH:mm", label: "14:30 (24h)" },
  { value: "hh:mm a", label: "2:30 PM (12h)" },
];

const paymentTermsOptions = [
  { value: "NET_15", label: "15 jours" },
  { value: "NET_30", label: "30 jours" },
  { value: "NET_45", label: "45 jours" },
  { value: "NET_60", label: "60 jours" },
  { value: "NET_90", label: "90 jours" },
  { value: "EOM", label: "Fin de mois" },
  { value: "IMMEDIATE", label: "Immédiat" },
];

export function GeneralSettingsForm() {
  const utils = api.useUtils();
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = api.settings.general.getAll.useQuery();

  const updateMutation = api.settings.general.update.useMutation({
    onSuccess: () => {
      toast.success("Paramètres généraux mis à jour avec succès");
      void utils.settings.general.invalidate();
    },
    onError: (e) => toast.error(e.message || "Erreur lors de la mise à jour"),
  });

  const form = useForm<UpdateGeneralSettingsInput>({
    resolver: zodResolver(updateGeneralSettingsSchema) as any,
    defaultValues: {
      currency: "XOF",
      language: "fr",
      timezone: "Africa/Porto-Novo",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "HH:mm",
      automaticNumbering: true,
      defaultPaymentTerms: "NET_30",
      defaultDiscount: 0,
      vatRate: 18,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        currency: settings.currency ?? "XOF",
        language: settings.language ?? "fr",
        timezone: settings.timezone ?? "Africa/Porto-Novo",
        dateFormat: settings.dateFormat ?? "DD/MM/YYYY",
        timeFormat: settings.timeFormat ?? "HH:mm",
        automaticNumbering: settings.automaticNumbering ?? true,
        defaultPaymentTerms: settings.defaultPaymentTerms ?? "NET_30",
        defaultDiscount: settings.defaultDiscount ?? 0,
        vatRate: settings.vatRate ?? 18,
      });
    }
  }, [settings, form]);

  const onSubmit = (values: UpdateGeneralSettingsInput) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-200 rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error?.message ?? "Impossible de charger les paramètres généraux."
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Localisation */}
        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="currency"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="currency">Devise *</FieldLabel>
                      <SingleSelect
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner une devise"
                        options={currencyOptions}
                        btnClassName="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="language"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="language">Langue *</FieldLabel>
                      <SingleSelect
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner une langue"
                        options={languageOptions}
                        btnClassName="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="timezone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="timezone">
                        Fuseau horaire *
                      </FieldLabel>
                      <SingleSelect
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner un fuseau horaire"
                        options={timezoneOptions}
                        btnClassName="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="dateFormat"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="dateFormat">
                        Format de date *
                      </FieldLabel>
                      <SingleSelect
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner un format"
                        options={dateFormatOptions}
                        btnClassName="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="timeFormat"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="timeFormat">
                        Format d'heure *
                      </FieldLabel>
                      <SingleSelect
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner un format"
                        options={timeFormatOptions}
                        btnClassName="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="defaultPaymentTerms"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="defaultPaymentTerms">
                        Conditions de paiement
                      </FieldLabel>
                      <SingleSelect
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner"
                        options={paymentTermsOptions}
                        btnClassName="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="defaultDiscount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="defaultDiscount">
                        Remise par défaut (%)
                      </FieldLabel>
                      <Input
                        {...field}
                        id="defaultDiscount"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="vatRate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="vatRate">
                        Taux de TVA par défaut (%)
                      </FieldLabel>
                      <Input
                        {...field}
                        id="vatRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="automaticNumbering"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal" className="max-w-sm">
                      <FieldContent>
                        <FieldLabel htmlFor="switch-focus-mode">
                          Activer la numérotation automatique
                        </FieldLabel>
                        <FieldDescription>
                          Les documents seront numérotés automatiquement avec
                          des séquences uniques.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        checked={field.value ?? true}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Icon icon={SaveIcon} className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
