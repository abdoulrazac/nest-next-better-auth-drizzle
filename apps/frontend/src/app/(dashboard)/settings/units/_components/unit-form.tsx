// @ts-nocheck
import SingleSelect from "@/components/single-select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { createUnitSchema } from "@/server/api/common/schemas/unit.schema";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { z } from "zod";

export const unitSchema = createUnitSchema;
export type UnitFormValues = z.input<typeof createUnitSchema>;

export const unitDefaultValues: UnitFormValues = {
  code: "",
  name: "",
  abbreviation: "",
  description: "",
  baseUnitId: "",
  conversionFactor: undefined,
  status: "ACTIVE",
};

interface UnitFormFieldsProps {
  form: UseFormReturn<UnitFormValues>;
}

export function UnitFormFields({ form }: UnitFormFieldsProps) {
  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={form.control}
          name="code"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="code">Code</FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} id="code" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
          name="abbreviation"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="abbreviation">Abréviation</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id="abbreviation"
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
        <Controller
          control={form.control}
          name="baseUnitId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="baseUnitId">ID unité de base</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id="baseUnitId"
                value={field.value ?? ""}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="conversionFactor"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="conversionFactor">
                Facteur de conversion
              </FieldLabel>
              <Input
                aria-invalid={fieldState.invalid}
                id="conversionFactor"
                min={0.01}
                onChange={(event) =>
                  field.onChange(event.target.valueAsNumber || undefined)
                }
                step="0.01"
                type="number"
                value={field.value ?? ""}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
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
