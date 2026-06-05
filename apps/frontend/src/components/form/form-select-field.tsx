"use client";

import SingleSelect, {
  type SingleSelectOption,
} from "@/components/single-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";

// ── Internal MultiSelect ───────────────────────────────────────────────────

interface MultiSelectProps {
  options: SingleSelectOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  onSearchChange?: (q: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

function MultiSelect({
  options,
  value = [],
  onValueChange,
  onSearchChange,
  onBlur,
  placeholder = "Sélectionner...",
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (option: string) => {
    const next = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onValueChange?.(next);
  };

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
          disabled={disabled}
        >
          {value.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {selectedLabels.map((lbl) => (
                <Badge key={lbl} variant="secondary" className="text-xs">
                  {lbl}
                </Badge>
              ))}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Rechercher..."
            onValueChange={onSearchChange}
          />
          <CommandList>
            <CommandEmpty>Aucun résultat.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggle(option.value)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      value.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <HugeiconsIcon icon={CheckIcon} className="h-3 w-3" />
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── FormSelectField ────────────────────────────────────────────────────────

interface FormSelectFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  defaultValue?: PathValue<T, Path<T>>;
  options: SingleSelectOption[];
  placeholder?: string;
  onSearchChange?: (q: string) => void;
  variant?: "single" | "multi";
}

export function FormSelectField<T extends FieldValues>({
  form,
  name,
  label,
  required = false,
  description,
  disabled = false,
  defaultValue,
  options,
  placeholder,
  onSearchChange,
  variant = "single",
}: FormSelectFieldProps<T>) {
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
          {variant === "single" ? (
            <SingleSelect
              options={options}
              value={field.value ?? ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              onSearchChange={onSearchChange}
              placeholder={placeholder}
              disabled={disabled}
            />
          ) : (
            <MultiSelect
              options={options}
              value={field.value ?? []}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              onSearchChange={onSearchChange}
              placeholder={placeholder}
              disabled={disabled}
            />
          )}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
