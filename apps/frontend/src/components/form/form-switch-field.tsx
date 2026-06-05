"use client";

import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

interface FormSwitchFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  defaultValue?: PathValue<T, Path<T>>;
}

export function FormSwitchField<T extends FieldValues>({
  form,
  name,
  label,
  required = false,
  description,
  disabled = false,
  defaultValue,
}: FormSwitchFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid}>
          <FieldContent>
            <FieldLabel htmlFor={String(name)}>
              {label}
              {required && " *"}
            </FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
          <Switch
            id={String(name)}
            ref={field.ref}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
          />
        </Field>
      )}
    />
  );
}
