// @ts-nocheck
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
  MCF_TAX_GROUPS,
  createTaxRateSchema,
} from "@/server/api/common/schemas/tax-rate.schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

export const taxRateSchema = createTaxRateSchema;
export type TaxRateFormValues = z.input<typeof createTaxRateSchema>;

export const taxRateDefaultValues: TaxRateFormValues = {
  name: "",
  rate: 0,
  code: "",
  description: "",
  isDefault: false,
  status: "ACTIVE",
  taxGroup: undefined,
};

interface TaxRateFormFieldsProps {
  form: UseFormReturn<TaxRateFormValues>;
}

export function TaxRateFormFields({ form }: TaxRateFormFieldsProps) {
  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nom</FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} id="name" />
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
                onChange={(event) =>
                  field.onChange(event.target.valueAsNumber || 0)
                }
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
          name="code"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="code">Code (optionnel)</FieldLabel>
              <SingleSelect
                btnClassName="w-full max-w-lg"
                onValueChange={(value) => field.onChange(value || "")}
                options={[
                  { label: "Normal", value: "NORMAL" },
                  { label: "Réduit", value: "REDUCED" },
                  { label: "Exonéré", value: "EXEMPT" },
                ]}
                placeholder="Sélectionner"
                value={field.value ?? ""}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="taxGroup"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="taxGroup">Code Groupe</FieldLabel>
              <SingleSelect
                btnClassName="w-full max-w-lg"
                onValueChange={(value) => field.onChange(value || undefined)}
                options={MCF_TAX_GROUPS.map((g) => ({
                  label: `Groupe ${g}`,
                  value: g,
                }))}
                placeholder="Sélectionner"
                value={field.value ?? ""}
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
                btnClassName="w-full max-w-lg"
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
            <FieldLabel htmlFor="isDefault">Taux par défaut</FieldLabel>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                aria-invalid={fieldState.invalid}
                id="description"
                rows={4}
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
// Embedded TaxRateForm — supports formId + onCreated for dialog usage
// ---------------------------------------------------------------------------

interface TaxRateFormProps {
  formId?: string;
  onCreated?: (taxRate: { id: string; label: string; rate: number }) => void;
}

export function TaxRateForm({ formId, onCreated }: TaxRateFormProps) {
  const utils = api.useUtils();

  const form = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateSchema) as any,
    defaultValues: taxRateDefaultValues,
  });

  const createMutation = api.common.taxRate.create.useMutation({
    onSuccess: (data: any) => {
      void utils.common.taxRate.invalidate();
      toast.success("Taux de TVA créé.");
      if (onCreated) {
        onCreated({ id: data.id, label: data.label, rate: data.rate });
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (values: TaxRateFormValues) => {
    createMutation.mutate({
      ...values,
      name: values.name.trim(),
      code: values.code || undefined,
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
      <TaxRateFormFields form={form} />
    </form>
  );
}
