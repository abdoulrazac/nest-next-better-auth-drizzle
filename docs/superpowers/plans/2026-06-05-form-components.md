# Form Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer `apps/frontend/src/components/form/` avec 7 composants génériques (FormActions, FormTextField, FormTextareaField, FormSwitchField, FormCheckboxField, FormSelectField, FormDateField) et migrer 3 formulaires existants.

**Architecture:** Chaque composant encapsule le pattern `Controller` + `Field` + `FieldLabel` + `FieldError` de `components/ui/field.tsx`. Tous sont des fonctions génériques TypeScript `<T extends FieldValues>` qui acceptent `form: UseFormReturn<T>` et `name: Path<T>` pour la type-safety. `FormActions` est le seul composant non-field ; il adapte son wrapper selon `variant="page"|"dialog"`.

**Tech Stack:** React Hook Form (`Controller`, `UseFormReturn`, `Path`, `PathValue`, `FieldValues`), composants `Field`/`FieldLabel`/`FieldError`/`FieldDescription`/`FieldContent`/`FieldGroup` de `components/ui/field.tsx`, `SingleSelect`, `CalendarPopover`, Popover+Command (multi-select), `DialogFooter`, icône `LoadingIcon` de `@/lib/icons`.

---

## Fichiers créés / modifiés

| Fichier                                       | Action   |
| --------------------------------------------- | -------- |
| `src/components/form/form-actions.tsx`        | Créer    |
| `src/components/form/form-text-field.tsx`     | Créer    |
| `src/components/form/form-textarea-field.tsx` | Créer    |
| `src/components/form/form-switch-field.tsx`   | Créer    |
| `src/components/form/form-checkbox-field.tsx` | Créer    |
| `src/components/form/form-select-field.tsx`   | Créer    |
| `src/components/form/form-date-field.tsx`     | Créer    |
| `src/components/form/index.ts`                | Créer    |
| `src/features/roles/role-form.tsx`            | Modifier |
| `src/features/roles/mutate-dialog.tsx`        | Modifier |
| `src/features/users/mutate-dialog.tsx`        | Modifier |

---

## Task 1 : `form-actions.tsx`

**Fichiers :**

- Créer : `apps/frontend/src/components/form/form-actions.tsx`

- [ ] **Créer le fichier**

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { LoadingIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface FormActionsProps {
  variant: "page" | "dialog";
  isLoading?: boolean;
  disabled?: boolean;
  submitLabel?: string;
  submitLoadingLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onReset?: () => void;
  resetLabel?: string;
}

export function FormActions({
  variant,
  isLoading = false,
  disabled = false,
  submitLabel = "Enregistrer",
  submitLoadingLabel = "Enregistrement...",
  cancelLabel = "Annuler",
  onCancel,
  onReset,
  resetLabel = "Réinitialiser",
}: FormActionsProps) {
  const isDisabled = isLoading || disabled;

  const buttons = (
    <>
      {onReset && (
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isDisabled}
        >
          {resetLabel}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isDisabled}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={isDisabled}>
        {isLoading && (
          <Icon icon={LoadingIcon} className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isLoading ? submitLoadingLabel : submitLabel}
      </Button>
    </>
  );

  if (variant === "dialog") {
    return (
      <DialogFooter className="px-6 py-4 border-t shrink-0">
        {buttons}
      </DialogFooter>
    );
  }

  return <div className="flex items-center gap-3 justify-end">{buttons}</div>;
}
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

Attendu : 0 erreur dans `form-actions.tsx` (des erreurs pré-existantes dans d'autres fichiers sont normales).

- [ ] **Commit**

```bash
git add apps/frontend/src/components/form/form-actions.tsx
git commit -m "feat: add FormActions component to components/form/"
```

---

## Task 2 : `form-text-field.tsx`

**Fichiers :**

- Créer : `apps/frontend/src/components/form/form-text-field.tsx`

- [ ] **Créer le fichier**

```tsx
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
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/form/form-text-field.tsx
git commit -m "feat: add FormTextField component"
```

---

## Task 3 : `form-textarea-field.tsx`

**Fichiers :**

- Créer : `apps/frontend/src/components/form/form-textarea-field.tsx`

- [ ] **Créer le fichier**

```tsx
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
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/form/form-textarea-field.tsx
git commit -m "feat: add FormTextareaField component"
```

---

## Task 4 : `form-switch-field.tsx`

**Fichiers :**

- Créer : `apps/frontend/src/components/form/form-switch-field.tsx`

- [ ] **Créer le fichier**

```tsx
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
          </FieldContent>
          <Switch
            id={String(name)}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/form/form-switch-field.tsx
git commit -m "feat: add FormSwitchField component"
```

---

## Task 5 : `form-checkbox-field.tsx`

**Fichiers :**

- Créer : `apps/frontend/src/components/form/form-checkbox-field.tsx`

- [ ] **Créer le fichier**

```tsx
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
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            required={required}
          />
          <div className="flex flex-col gap-0.5">
            <FieldLabel htmlFor={String(name)}>
              {label}
              {required && " *"}
            </FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/form/form-checkbox-field.tsx
git commit -m "feat: add FormCheckboxField component"
```

---

## Task 6 : `form-select-field.tsx`

Contient deux rendus selon `variant` : `"single"` (via `SingleSelect`) et `"multi"` (multi-select inline Popover+Command+badges).

**Fichiers :**

- Créer : `apps/frontend/src/components/form/form-select-field.tsx`

- [ ] **Créer le fichier**

```tsx
"use client";

import { useState } from "react";
import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import SingleSelect, {
  type SingleSelectOption,
} from "@/components/single-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Icon } from "@/components/ui/icon";
import { CheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ── Internal MultiSelect ───────────────────────────────────────────────────

interface MultiSelectProps {
  options: SingleSelectOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  onSearchChange?: (q: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function MultiSelect({
  options,
  value = [],
  onValueChange,
  onSearchChange,
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
    <Popover open={open} onOpenChange={setOpen}>
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
                    <Icon icon={CheckIcon} className="h-3 w-3" />
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
              onSearchChange={onSearchChange}
              placeholder={placeholder}
              disabled={disabled}
            />
          ) : (
            <MultiSelect
              options={options}
              value={field.value ?? []}
              onValueChange={field.onChange}
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
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/form/form-select-field.tsx
git commit -m "feat: add FormSelectField component (single + multi variants)"
```

---

## Task 7 : `form-date-field.tsx`

**Fichiers :**

- Créer : `apps/frontend/src/components/form/form-date-field.tsx`

- [ ] **Créer le fichier**

```tsx
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
            disabled={
              disabled
                ? () => true
                : minDate || maxDate
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
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/form/form-date-field.tsx
git commit -m "feat: add FormDateField component"
```

---

## Task 8 : Barrel `index.ts`

**Fichiers :**

- Créer : `apps/frontend/src/components/form/index.ts`

- [ ] **Créer le fichier**

```ts
export { FormActions } from "./form-actions";
export { FormTextField } from "./form-text-field";
export { FormTextareaField } from "./form-textarea-field";
export { FormSwitchField } from "./form-switch-field";
export { FormCheckboxField } from "./form-checkbox-field";
export { FormSelectField } from "./form-select-field";
export { FormDateField } from "./form-date-field";
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/form/index.ts
git commit -m "feat: add components/form barrel index.ts"
```

---

## Task 9 : Migrer `features/roles/role-form.tsx`

Remplace les blocs `Controller + Field + FieldLabel + Input + FieldError` par `FormTextField`, et le groupe de boutons par `FormActions`.

**Fichiers :**

- Modifier : `apps/frontend/src/features/roles/role-form.tsx`

- [ ] **Lire le fichier actuel**

```bash
cat apps/frontend/src/features/roles/role-form.tsx
```

- [ ] **Remplacer l'import des composants Field**

Ajouter l'import `components/form` et supprimer les imports de Field devenus inutiles :

```tsx
// Ajouter
import { FormTextField, FormActions } from "@/components/form";
```

- [ ] **Remplacer les champs texte**

Chaque bloc de ce pattern :

```tsx
<Controller
  name="name"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="name">Nom du rôle *</FieldLabel>
      <Input {...field} id="name" placeholder="Ex: Administrateur" />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

devient :

```tsx
<FormTextField
  form={form}
  name="name"
  label="Nom du rôle"
  required
  placeholder="Ex: Administrateur"
  disabled={isSubmitting}
/>
```

Appliquer pour tous les champs texte du formulaire (vérifier le fichier lu à l'étape précédente pour les noms exacts).

- [ ] **Remplacer le groupe de boutons**

Le bloc :

```tsx
<div className="flex items-center gap-3 justify-end">
  <Button
    type="button"
    variant="outline"
    onClick={() => form.reset()}
    disabled={isSubmitting}
  >
    Réinitialiser
  </Button>
  <Button
    type="button"
    variant="ghost"
    onClick={() => router.push("/accounts/roles")}
    disabled={isSubmitting}
  >
    Annuler
  </Button>
  <Button type="submit" disabled={isSubmitting || permissionsLoading}>
    {isSubmitting
      ? isEdit
        ? "Mise à jour..."
        : "Création..."
      : isEdit
        ? "Mettre à jour"
        : "Créer le rôle"}
  </Button>
</div>
```

devient :

```tsx
<FormActions
  variant="page"
  isLoading={isSubmitting}
  disabled={permissionsLoading}
  submitLabel={isEdit ? "Mettre à jour" : "Créer le rôle"}
  submitLoadingLabel={isEdit ? "Mise à jour..." : "Création..."}
  onCancel={() => router.push("/accounts/roles")}
  onReset={() => form.reset()}
/>
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/roles/role-form.tsx
git commit -m "refactor(roles): migrate role-form to FormTextField + FormActions"
```

---

## Task 10 : Migrer `features/roles/mutate-dialog.tsx`

**Fichiers :**

- Modifier : `apps/frontend/src/features/roles/mutate-dialog.tsx`

- [ ] **Lire le fichier actuel**

```bash
cat apps/frontend/src/features/roles/mutate-dialog.tsx
```

- [ ] **Ajouter les imports**

```tsx
import { FormTextField, FormActions } from "@/components/form";
```

- [ ] **Remplacer les champs texte** par `FormTextField` (même pattern que Task 9).

- [ ] **Remplacer `<DialogFooter>` + boutons**

Le bloc :

```tsx
<DialogFooter className="px-6 py-4 border-t shrink-0">
  <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isPending}>Réinitialiser</Button>
  <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>Annuler</Button>
  <Button type="submit" disabled={isPending}>{...}</Button>
</DialogFooter>
```

devient :

```tsx
<FormActions
  variant="dialog"
  isLoading={isPending}
  submitLabel={isEdit ? "Mettre à jour" : "Créer le rôle"}
  submitLoadingLabel={isEdit ? "Mise à jour..." : "Création..."}
  onCancel={() => onOpenChange(false)}
  onReset={() => form.reset()}
/>
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/roles/mutate-dialog.tsx
git commit -m "refactor(roles): migrate mutate-dialog to FormTextField + FormActions"
```

---

## Task 11 : Migrer `features/users/mutate-dialog.tsx`

**Fichiers :**

- Modifier : `apps/frontend/src/features/users/mutate-dialog.tsx`

- [ ] **Lire le fichier actuel**

```bash
cat apps/frontend/src/features/users/mutate-dialog.tsx
```

- [ ] **Ajouter les imports**

```tsx
import { FormTextField, FormSelectField, FormActions } from "@/components/form";
```

- [ ] **Migrer les champs `name` et `email`**

Le formulaire utilise Pattern B (`register` + `Label` + `Input`). Convertir en :

```tsx
// name field
<FormTextField
  form={form}
  name="name"
  label="Nom"
  required
  placeholder="Nom complet"
  disabled={isPending}
/>

// email field
<FormTextField
  form={form}
  name="email"
  label="Email"
  required
  type="email"
  placeholder="exemple@email.com"
  disabled={isPending}
/>
```

- [ ] **Migrer le champ `role` (shadcn Select → FormSelectField)**

Le bloc Select natif shadcn :

```tsx
<Select value={...} onValueChange={...}>
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>
    <SelectItem value="ADMIN">Admin</SelectItem>
    <SelectItem value="STAFF">Staff</SelectItem>
    <SelectItem value="CLIENT">Client</SelectItem>
  </SelectContent>
</Select>
```

devient :

```tsx
<FormSelectField
  form={form}
  name="role"
  label="Rôle"
  required
  options={[
    { value: "ADMIN", label: "Admin" },
    { value: "STAFF", label: "Staff" },
    { value: "CLIENT", label: "Client" },
  ]}
  placeholder="Choisir un rôle..."
  disabled={isPending}
/>
```

- [ ] **Remplacer `<DialogFooter>` + boutons**

```tsx
<FormActions
  variant="dialog"
  isLoading={isPending}
  submitLabel={isEdit ? "Sauvegarder" : "Créer"}
  submitLoadingLabel="Enregistrement..."
  onCancel={() => onOpenChange(false)}
/>
```

- [ ] **Vérifier TypeScript**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/users/mutate-dialog.tsx
git commit -m "refactor(users): migrate mutate-dialog to FormTextField + FormSelectField + FormActions"
```

---

## Task 12 : Vérification finale

- [ ] **TypeScript global**

```bash
cd apps/frontend && bunx tsc --noEmit 2>&1 | grep "components/form\|features/roles\|features/users"
```

Attendu : aucune erreur dans les fichiers créés/migrés. Les erreurs pré-existantes dans `auth-provider.tsx`, `conversations.repository.ts`, `button-group.tsx` sont connues et hors scope.

- [ ] **Build Next.js**

```bash
cd apps/frontend && bunx next build 2>&1 | tail -20
```

Attendu : build réussi (même si des warnings apparaissent).

- [ ] **Commit final si nécessaire**

Si des corrections mineures ont été apportées lors de la vérification :

```bash
git add -p
git commit -m "fix: form components TypeScript corrections"
```
