"use client";

import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import CalendarPopover from "@/components/calendar-popover";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

interface FormDateFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  defaultValue?: PathValue<T, Path<T>>;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function FormDateField<T extends FieldValues>({
  form,
  name,
  label,
  required = false,
  description,
  disabled = false,
  defaultValue,
  placeholder = "Sélectionner une date",
  minDate,
  maxDate,
}: FormDateFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>
            {label}
            {required && " *"}
          </FieldLabel>
          <CalendarPopover
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
            triggerDisabled={disabled}
            disabled={
              minDate || maxDate
                ? (date: Date) => {
                    if (minDate && date < minDate) return true;
                    if (maxDate && date > maxDate) return true;
                    return false;
                  }
                : undefined
            }
            startMonth={minDate}
            endMonth={maxDate}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
