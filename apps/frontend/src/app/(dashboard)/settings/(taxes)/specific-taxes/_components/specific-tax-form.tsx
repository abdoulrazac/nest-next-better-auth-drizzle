"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { z } from "zod";

export const specificTaxSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  rate: z.coerce.number().min(0).max(100),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type SpecificTaxFormValues = z.infer<typeof specificTaxSchema>;

export const specificTaxDefaultValues: SpecificTaxFormValues = {
  name: "",
  rate: 0,
  description: "",
  status: "ACTIVE",
};

interface SpecificTaxFormFieldsProps {
  form: UseFormReturn<SpecificTaxFormValues>;
}

export function SpecificTaxFormFields({ form }: SpecificTaxFormFieldsProps) {
  const { control } = form;
  return (
    <FieldGroup className="grid grid-cols-2 gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Field className="col-span-2" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="name">Nom *</FieldLabel>
            <Input {...field} id="name" placeholder="Ex: Taxe carburant" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="rate"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="rate">Taux (%) *</FieldLabel>
            <Input
              id="rate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={field.value}
              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="status">Statut</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <Field className="col-span-2" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Input
              {...field}
              id="description"
              value={field.value ?? ""}
              placeholder="Description optionnelle"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
