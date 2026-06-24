# Spec : Generic Form Components (`components/form/`)

**Date :** 2026-06-05  
**Statut :** approuvé

---

## Contexte

Le codebase frontend ne dispose d'aucun composant partagé pour les boutons de formulaire ni pour les champs de saisie. Chaque formulaire duplique manuellement le pattern `Controller` + `Field` + `FieldLabel` + `FieldError` de `components/ui/field.tsx`, avec des classNames et des comportements légèrement divergents selon les fichiers.

Ce spec définit un dossier `components/form/` qui centralise ces primitives réutilisables.

---

## Périmètre

### Fichiers à créer

```
apps/frontend/src/components/form/
├── index.ts                  # barrel — exporte tout
├── form-actions.tsx          # groupe de boutons submit/cancel/reset
├── form-text-field.tsx       # champ texte / email / number
├── form-textarea-field.tsx   # champ textarea
├── form-switch-field.tsx     # switch horizontal (label + description)
├── form-checkbox-field.tsx   # checkbox horizontal
├── form-select-field.tsx     # select single ou multi
└── form-date-field.tsx       # date picker (CalendarPopover)
```

### Formulaires à migrer (scope limité)

| Fichier                            | Composants appliqués                                                        |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `features/roles/role-form.tsx`     | `FormTextField`, `FormActions` (variant=page, avec reset)                   |
| `features/roles/mutate-dialog.tsx` | `FormTextField`, `FormActions` (variant=dialog, avec reset)                 |
| `features/users/mutate-dialog.tsx` | `FormTextField`, `FormSelectField` (single), `FormActions` (variant=dialog) |

Les formulaires `settings/` (save-only, un seul bouton) et les dialogs Better Auth (`create-user-form`, `update-role-form`) sont hors scope.

---

## `FormActions`

### Fichier

`components/form/form-actions.tsx`

### Comportement

- Render le groupe de boutons d'un formulaire avec un wrapper adapté à la surface.
- Bouton **submit** : toujours présent, `type="submit"`. En état `isLoading` : icône `Loading01Icon` animée + `submitLoadingLabel`. Au repos : icône `submitIcon` optionnel + `submitLabel`.
- Bouton **cancel** : toujours présent, `type="button"`, `variant="ghost"`, désactivé quand `isLoading`.
- Bouton **reset** : affiché uniquement si `onReset` est fourni, `type="button"`, `variant="outline"`, désactivé quand `isLoading`.
- Ordre gauche → droite : Reset → Cancel → Submit.

### Props

| Prop                 | Type                 | Défaut                | Description                                       |
| -------------------- | -------------------- | --------------------- | ------------------------------------------------- |
| `variant`            | `"page" \| "dialog"` | requis                | Wrapper HTML utilisé                              |
| `isLoading`          | `boolean`            | `false`               | État de chargement                                |
| `disabled`           | `boolean`            | `false`               | Désactive tous les boutons (en plus de isLoading) |
| `submitLabel`        | `string`             | `"Enregistrer"`       | Texte du bouton submit au repos                   |
| `submitLoadingLabel` | `string`             | `"Enregistrement..."` | Texte pendant isLoading                           |
| `cancelLabel`        | `string`             | `"Annuler"`           | Texte du bouton cancel                            |
| `onCancel`           | `() => void`         | requis                | Handler du bouton cancel                          |
| `onReset`            | `() => void`         | —                     | Si fourni, affiche le bouton reset                |
| `resetLabel`         | `string`             | `"Réinitialiser"`     | Texte du bouton reset                             |

### Rendu du wrapper

- `variant="page"` → `<div className="flex items-center gap-3 justify-end">`
- `variant="dialog"` → `<DialogFooter className="px-6 py-4 border-t shrink-0">`

---

## Props communes — Field components

Tous les composants field partagent ces props. Ils utilisent `Controller` de RHF et les primitives `Field`, `FieldLabel`, `FieldDescription`, `FieldError` de `components/ui/field.tsx`.

| Prop           | Type                    | Défaut  | Description                                                          |
| -------------- | ----------------------- | ------- | -------------------------------------------------------------------- |
| `form`         | `UseFormReturn<T>`      | requis  | Instance RHF                                                         |
| `name`         | `Path<T>`               | requis  | Chemin type-safe vers la valeur                                      |
| `label`        | `string`                | requis  | Libellé affiché                                                      |
| `required`     | `boolean`               | `false` | Ajoute ` *` après le label et l'attribut HTML `required` sur l'input |
| `description`  | `string`                | —       | Texte d'aide sous le champ (`FieldDescription`)                      |
| `disabled`     | `boolean`               | `false` | Désactive le champ                                                   |
| `defaultValue` | `PathValue<T, Path<T>>` | —       | Valeur initiale passée à `Controller`                                |

Tous les composants sont des fonctions génériques : `function FormTextField<T extends FieldValues>(...)`.

---

## `FormTextField`

Champ de saisie texte, email ou nombre.

**Props supplémentaires :**

| Prop          | Type                            | Défaut   |
| ------------- | ------------------------------- | -------- |
| `type`        | `"text" \| "email" \| "number"` | `"text"` |
| `placeholder` | `string`                        | —        |
| `autoFocus`   | `boolean`                       | `false`  |

**Rendu interne :**

```tsx
<Controller
  name={name}
  control={form.control}
  defaultValue={defaultValue}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && " *"}
      </FieldLabel>
      <Input
        {...field}
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

---

## `FormTextareaField`

**Props supplémentaires :**

| Prop          | Type     | Défaut |
| ------------- | -------- | ------ |
| `placeholder` | `string` | —      |
| `rows`        | `number` | `3`    |

---

## `FormSwitchField`

Switch horizontal — `Field` avec `orientation="horizontal"`, `FieldContent` pour label + description, `Switch` à droite.

Aucune prop supplémentaire au-delà des props communes. La `description` est affichée inline dans `FieldContent` (sous le label), pas sous le champ.

---

## `FormCheckboxField`

Checkbox horizontal — `Field` avec `orientation="horizontal"`, `Checkbox` + `FieldLabel` côte à côte.

Aucune prop supplémentaire.

---

## `FormSelectField`

Wrappeur de `SingleSelect` (variant single) ou d'un multi-select (variant multi).

**Props supplémentaires :**

| Prop             | Type                                 | Défaut     |
| ---------------- | ------------------------------------ | ---------- |
| `variant`        | `"single" \| "multi"`                | `"single"` |
| `options`        | `{ value: string; label: string }[]` | requis     |
| `placeholder`    | `string`                             | —          |
| `onSearchChange` | `(q: string) => void`                | —          |

- `variant="single"` → valeur RHF de type `string`, rendu via `SingleSelect` existant (`components/single-select.tsx`)
- `variant="multi"` → valeur RHF de type `string[]`, rendu via un `MultiSelect` implémenté inline dans `form-select-field.tsx` (Popover + Command + badges de sélection)

---

## `FormDateField`

Wrappeur de `CalendarPopover` (`components/calendar-popover.tsx`).

**Props supplémentaires :**

| Prop          | Type     | Défaut                    |
| ------------- | -------- | ------------------------- |
| `placeholder` | `string` | `"Sélectionner une date"` |
| `minDate`     | `Date`   | —                         |
| `maxDate`     | `Date`   | —                         |

---

## Contraintes et conventions

- `"use client"` en tête de chaque fichier
- Icônes via `@/lib/icons` + `Icon` — jamais d'import direct depuis `@hugeicons/core-free-icons`
- Labels, placeholders, messages en français
- Zod v4 : `zodResolver(schema as any) as any` dans les formulaires consommateurs (inchangé)
- Le `index.ts` exporte tous les composants nommément (pas de `export * from`)

---

## Hors scope

- Champ password (toggle show/hide) — cas trop spécifique, restera inline
- Champ file/upload — géré par `@better-upload/client`, trop couplé au contexte
- Migration des formulaires `settings/` — un seul bouton, `FormActions` n'apporte pas de valeur
- Migration des dialogs Better Auth — ne pas toucher
