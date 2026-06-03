// @ts-nocheck
"use client";

import SingleSelect from "@/components/single-select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import {
  createPsvbRateSchema,
  PSVB_DEFAULT_RATES,
  PSVB_GROUP_LABELS,
  PSVB_GROUPS,
} from "@/server/api/common/schemas/psvb-rate.schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

export const psvbRateSchema = createPsvbRateSchema;
export type PsvbRateFormValues = z.input<typeof createPsvbRateSchema>;

export const psvbRateDefaultValues: PsvbRateFormValues = {
  label: "",
  group: "A",
  rate: 2,
  isDefault: false,
  status: "ACTIVE",
  description: "",
};

interface PsvbRateFormFieldsProps {
  form: UseFormReturn<PsvbRateFormValues>;
}

export function PsvbRateFormFields({ form }: PsvbRateFormFieldsProps) {
  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={form.control}
          name="label"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="label">Libellé</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id="label"
                placeholder="Ex: PSVB droit commun"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="group"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="group">Groupe PSVB</FieldLabel>
              <SingleSelect
                btnClassName="w-full"
                onValueChange={(value) => {
                  field.onChange(value);
                  // Pré-remplir le taux DGI par défaut
                  if (value && value in PSVB_DEFAULT_RATES) {
                    form.setValue(
                      "rate",
                      PSVB_DEFAULT_RATES[
                        value as keyof typeof PSVB_DEFAULT_RATES
                      ],
                    );
                    form.setValue(
                      "label",
                      PSVB_GROUP_LABELS[
                        value as keyof typeof PSVB_GROUP_LABELS
                      ],
                    );
                  }
                }}
                options={PSVB_GROUPS.map((g) => ({
                  label: PSVB_GROUP_LABELS[g],
                  value: g,
                }))}
                placeholder="Sélectionner un groupe"
                value={field.value ?? ""}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="rate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="rate">Taux (%)</FieldLabel>
              <Input
                aria-invalid={fieldState.invalid}
                id="rate"
                max={100}
                min={0}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                step="0.01"
                type="number"
                value={field.value}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="status"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="status">Statut</FieldLabel>
              <SingleSelect
                btnClassName="w-full"
                onValueChange={field.onChange}
                options={[
                  { label: "Actif", value: "ACTIVE" },
                  { label: "Inactif", value: "INACTIVE" },
                ]}
                placeholder="Sélectionner"
                value={field.value}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <Controller
        control={form.control}
        name="isDefault"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} orientation="horizontal">
            <Checkbox
              checked={field.value}
              id="isDefault"
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
            />
            <FieldLabel htmlFor="isDefault">Taux PSVB par défaut</FieldLabel>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">
              Description (optionnel)
            </FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                aria-invalid={fieldState.invalid}
                id="description"
                rows={3}
                value={field.value ?? ""}
              />
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}

// ---------------------------------------------------------------------------
// Embedded PsvbRateForm — pour usage dans un dialog
// ---------------------------------------------------------------------------

interface PsvbRateFormProps {
  formId?: string;
  onCreated?: (rate: {
    id: string;
    label: string;
    group: string;
    rate: number;
  }) => void;
}

export function PsvbRateForm({ formId, onCreated }: PsvbRateFormProps) {
  const utils = api.useUtils();

  const form = useForm<PsvbRateFormValues>({
    resolver: zodResolver(psvbRateSchema) as any,
    defaultValues: psvbRateDefaultValues,
  });

  const createMutation = api.common.psvbRate.create.useMutation({
    onSuccess: (data: any) => {
      void utils.common.psvbRate.invalidate();
      toast.success("Taux PSVB créé.");
      onCreated?.({
        id: data.id,
        label: data.label,
        group: data.group,
        rate: data.rate,
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (values: PsvbRateFormValues) => {
    createMutation.mutate({
      ...values,
      description: values.description || undefined,
    });
  };

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.stopPropagation();
        void form.handleSubmit(onSubmit)(e);
      }}
      className="space-y-6"
    >
      <PsvbRateFormFields form={form} />
    </form>
  );
}
