"use client";

import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

interface FormTextFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  defaultValue?: PathValue<T, Path<T>>;
  type?: "text" | "email" | "number";
  placeholder?: string;
  autoFocus?: boolean;
}

export function FormTextField<T extends FieldValues>({
  form,
  name,
  label,
  required = false,
  description,
  disabled = false,
  defaultValue,
  type = "text",
  placeholder,
  autoFocus = false,
}: FormTextFieldProps<T>) {
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
          <Input
            {...field}
            id={String(name)}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            value={field.value ?? ""}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
