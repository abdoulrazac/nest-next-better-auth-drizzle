"use client";

import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

interface FormTextareaFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  defaultValue?: PathValue<T, Path<T>>;
  placeholder?: string;
  rows?: number;
}

export function FormTextareaField<T extends FieldValues>({
  form,
  name,
  label,
  required = false,
  description,
  disabled = false,
  defaultValue,
  placeholder,
  rows = 3,
}: FormTextareaFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={String(name)}>
            {label}
            {required && " *"}
          </FieldLabel>
          <Textarea
            {...field}
            id={String(name)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            value={field.value ?? ""}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
