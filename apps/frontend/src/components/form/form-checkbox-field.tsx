"use client";

import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

interface FormCheckboxFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  defaultValue?: PathValue<T, Path<T>>;
}

export function FormCheckboxField<T extends FieldValues>({
  form,
  name,
  label,
  required = false,
  description,
  disabled = false,
  defaultValue,
}: FormCheckboxFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid}>
          <Checkbox
            id={String(name)}
            ref={field.ref}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            required={required}
          />
          <FieldContent>
            <FieldLabel htmlFor={String(name)}>
              {label}
              {required && " *"}
            </FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
        </Field>
      )}
    />
  );
}
