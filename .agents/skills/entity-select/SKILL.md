---
name: entity-select
description: "Scaffold a searchable entity select with debounced search via @repo/api-client, deduplication, and optional inline create dialog. Use when adding a searchable dropdown for a related entity (user, role, etc.) inside a form."
---

# Entity Select Scaffold

## When to Use

- Select d'une entité liée dans un formulaire
- Création inline sans quitter le formulaire
- Résultats paginés via `@repo/api-client`

## File Structure

```
src/features/<entity>/_components/
├── <entity>-select.tsx       # Select avec search debounced
└── create-<entity>-dialog.tsx # Dialog de création inline
```

## Step 1 — Entity Select

```tsx
"use client";

import SingleSelect from "@/components/single-select";
import { useQuery } from "@tanstack/react-query";
import { client } from "@repo/api-client";
import { useState } from "react";
import { CreateEntityDialog } from "./create-entity-dialog";

interface EntitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  defaultEntityId?: string;
  isEditing?: boolean;
  disabled?: boolean;
}

export function EntitySelect({
  value,
  onValueChange,
  defaultEntityId,
  isEditing,
  disabled,
}: EntitySelectProps) {
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: searchData } = useQuery({
    queryKey: ["entities", "search", query],
    queryFn: () => client.entities.list({ search: query, pageSize: 20 }),
  });

  const { data: defaultData } = useQuery({
    queryKey: ["entities", defaultEntityId],
    queryFn: () => client.entities.get({ path: { id: defaultEntityId! } }),
    enabled: !!defaultEntityId && !isEditing,
  });

  const { data: selectedData } = useQuery({
    queryKey: ["entities", value],
    queryFn: () => client.entities.get({ path: { id: value } }),
    enabled: !!value && value !== defaultEntityId,
  });

  const searchEntities = searchData?.data?.items ?? [];
  const extras = [defaultData?.data, selectedData?.data].filter(
    (e): e is NonNullable<typeof e> =>
      !!e && !searchEntities.find((s) => s.id === e.id),
  );
  const options = [...extras, ...searchEntities].map((e) => ({
    value: e.id,
    label: `${e.name}${e.reference ? ` (${e.reference})` : ""}`,
  }));

  return (
    <>
      <SingleSelect
        value={value}
        onValueChange={onValueChange}
        onSearchChange={setQuery}
        options={options}
        placeholder="Rechercher..."
        addNewLabel="Nouvel élément"
        onClickAddNew={() => setDialogOpen(true)}
        disabled={disabled}
        btnClassName="w-full max-w-lg"
      />
      <CreateEntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(entity) => {
          onValueChange(entity.id);
          setDialogOpen(false);
        }}
      />
    </>
  );
}
```

## Step 2 — Create Dialog

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EntityForm } from "./entity-form";

interface CreateEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (entity: {
    id: string;
    name: string;
    reference?: string;
  }) => void;
}

export function CreateEntityDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateEntityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvel élément</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="pr-3">
            <EntityForm
              formId="create-entity-dialog-form"
              onCreated={onCreated}
            />
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form="create-entity-dialog-form">
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Form Integration (React Hook Form)

```tsx
<Controller
  control={form.control}
  name="entityId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Entité *</FormLabel>
      <EntitySelect
        value={field.value}
        onValueChange={field.onChange}
        defaultEntityId={defaultEntityId}
        isEditing={isEditing}
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

## Checklist

- [ ] `useQuery` pour search + default + selected (3 queries, déduplication)
- [ ] `onSearchChange` → debounce 300ms dans `SingleSelect`
- [ ] `defaultEntityId` + `isEditing` pour pré-remplissage
- [ ] Dialog inline avec `formId` pour submit externe
- [ ] `btnClassName="w-full max-w-lg"` dans les formulaires
- [ ] Labels en français
