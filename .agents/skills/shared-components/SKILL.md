---
name: shared-components
description: "Reference guide for the project's shared UI components: BasePage, PageHeader, TableHeader, DataTable, CellActions, StatusBadge, DetailSection, DetailTabs, Pagination, SingleSelect, ConfirmDialog. Use when composing admin pages, configuring table headers, adding row actions, or using any shared component."
---

# Shared Components Reference

## Import rule — Icons

NEVER import from `@hugeicons/core-free-icons` directly. Always via `@/lib/icons`:

```tsx
import { EditIcon, TrashIcon, PlusIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";

<HugeiconsIcon icon={EditIcon} className="h-4 w-4" />;
```

---

## BasePage

Wraps every dashboard page. Provides header (SidebarTrigger + Breadcrumbs + CommandMenu + ThemeSwitcher) and max-width content area.

```tsx
import { BasePage } from "@/components/layout/base-page";

<BasePage breadcrumbs={[{ title: "Utilisateurs", url: "/account/users" }]}>
  {children}
</BasePage>;
```

| Prop          | Type                                | Required |
| ------------- | ----------------------------------- | -------- |
| `breadcrumbs` | `{ title: string; url?: string }[]` | No       |
| `children`    | `ReactNode`                         | Yes      |
| `className`   | `string`                            | No       |

---

## PageHeader

Page title with optional status, description, back navigation, and action buttons.

```tsx
import PageHeader, { PageHeaderActions } from "@/components/page-header";

// List page
<PageHeader
  title="Utilisateurs"
  description="Gérez vos utilisateurs"
  variant="list"
  primaryAction={PageHeaderActions.create("/account/users/new", "Nouvel utilisateur")}
/>

// Detail page with back button and status
<PageHeader
  title={user.name}
  variant="detail"
  backNavigation
  status={<StatusBadge status={user.status} />}
  primaryAction={PageHeaderActions.edit(`/account/users/${id}/edit`)}
/>

// Detail card variant (with background blur)
<PageHeader
  title={user.name}
  variant="detail-card"
  backNavigation={{ href: "/account/users", label: "Utilisateurs" }}
  primaryAction={PageHeaderActions.edit(`/account/users/${id}/edit`)}
  secondaryActions={[PageHeaderActions.export(handleExport)]}
/>
```

| Prop               | Type                                                                     | Required |
| ------------------ | ------------------------------------------------------------------------ | -------- |
| `title`            | `string`                                                                 | Yes      |
| `description`      | `string`                                                                 | No       |
| `variant`          | `"default" \| "list" \| "detail" \| "detail-card" \| "create" \| "edit"` | No       |
| `backNavigation`   | `boolean \| { label?: string; href?: string; onClick?: () => void }`     | No       |
| `primaryAction`    | `HeaderAction`                                                           | No       |
| `secondaryActions` | `HeaderAction[]`                                                         | No       |
| `status`           | `ReactNode`                                                              | No       |
| `isLoading`        | `boolean`                                                                | No       |

**PageHeaderActions helpers:**

- `PageHeaderActions.create(href, label?)` — bouton primaire avec icône +
- `PageHeaderActions.edit(href)` — bouton outline Modifier
- `PageHeaderActions.save(onClick, loading?)` — bouton Enregistrer
- `PageHeaderActions.delete(onClick)` — bouton destructive Supprimer
- `PageHeaderActions.export(onClick)` — bouton outline Exporter
- `PageHeaderActions.cancel(href)` — bouton ghost Annuler
- `PageHeaderActions.refresh(onClick)` — bouton ghost Actualiser

---

## TableHeader

Search bar + filters + reset + bulk action bar. **Toujours alimenté par `useTableParams`** (voir `@/hooks/use-table-params`) — jamais avec du `useState` manuel pour search/filtres/page.

```tsx
import TableHeader, {
  createSearchField,
  createFilterField,
  createResetButton,
  createBulkActions,
} from "@/components/table-header";
import SingleSelect from "@/components/single-select";

<TableHeader
  // second param de createSearchField = onSearch (appelé sur Enter ou bouton, pas à chaque frappe)
  // Utiliser les valeurs de useTableParams : search, setSearch, getFilter, setFilter, resetFilters
  search={createSearchField(search, setSearch, {
    placeholder: "Rechercher...",
  })}
  filters={[
    createFilterField(
      "status",
      <SingleSelect
        value={getFilter("status")}
        onValueChange={(v) => setFilter("status", v)} // setFilter auto-remet la page à 1
        options={[
          { value: "ACTIVE", label: "Actif" },
          { value: "INACTIVE", label: "Inactif" },
        ]}
        placeholder="Statut"
        btnClassName="min-w-28"
      />,
    ),
  ]}
  actions={[
    createResetButton(resetFilters), // remet search + filtres + page à 1 (pageSize préservé)
  ]}
  bulkActions={
    selectedItems.length > 0
      ? createBulkActions(
          selectedItems.length,
          [
            {
              label: "Supprimer",
              icon: <HugeiconsIcon icon={TrashIcon} className="h-4 w-4" />,
              onClick: handleBulkDelete,
              variant: "destructive",
            },
          ],
          { onClose: () => setSelectedItems([]) },
        )
      : undefined
  }
/>;
```

---

## DataTable

TanStack Table wrapper with sorting, selection, and loading skeleton.

```tsx
import { DataTable } from "@/components/data-table/data-table";

<DataTable
  columns={columns}
  data={items}
  isLoading={isLoading}
  pagination={false} // Use separate <Pagination /> below
  selectable
  onSelectionChange={setSelectedItems}
  emptyMessage="Aucun utilisateur trouvé."
/>;
```

| Prop                | Type                  | Default                    |
| ------------------- | --------------------- | -------------------------- |
| `columns`           | `ColumnDef<T>[]`      | required                   |
| `data`              | `T[]`                 | required                   |
| `isLoading`         | `boolean`             | `false`                    |
| `pagination`        | `boolean`             | `true`                     |
| `selectable`        | `boolean`             | `false`                    |
| `onSelectionChange` | `(rows: T[]) => void` | —                          |
| `onRowClick`        | `(row: T) => void`    | —                          |
| `emptyMessage`      | `string`              | `"Aucune donnée trouvée."` |

---

## CellActions

Row-level action buttons. First N visible inline, rest in dropdown.

```tsx
import CellActions, {
  createViewAction,
  createEditAction,
  createDeleteAction,
} from "@/components/cell-actions";

<CellActions
  visibleActions={1}
  actions={[
    createViewAction(() => setSelectedId(row.original.id)),
    createEditAction(() =>
      router.push(`/account/users/${row.original.id}/edit`),
    ),
    createDeleteAction(() => deleteUser.mutateAsync({ id: row.original.id })),
  ]}
/>;
```

**Factory functions:**

- `createViewAction(hrefOrFn, tooltip?)` — icône Eye
- `createEditAction(onClick, tooltip?)` — icône Edit
- `createDeleteAction(onClick, opts?)` — icône Trash, confirmDialog auto
- `createCopyAction(onClick, tooltip?)`
- `createOpenAction(onClick, tooltip?)`
- `createNavigateAction(href, tooltip?)`
- `createCancelAction(onClick, tooltip?)` — confirmDialog auto
- `createSendEmailAction(onClick, tooltip?)` — confirmDialog auto
- `createPreviewAction(onClick, tooltip?)`
- `createValidateAction(onClick, tooltip?)`
- `createDuplicateAction(onClick, tooltip?)`
- `createToggleStatusAction(onClick, isActive, tooltip?)`
- `createAction(icon, onClick?, options?)`

**StandardCellActions** pour les cas simples :

```tsx
import { StandardCellActions } from "@/components/cell-actions";

<StandardCellActions
  viewHref={`/account/users/${row.original.id}`}
  onEdit={() => router.push(`/account/users/${row.original.id}/edit`)}
  onDelete={() => deleteUser.mutateAsync({ id: row.original.id })}
  deleteLabel={`l'utilisateur "${row.original.name}"`}
/>;
```

---

## StatusBadge

Auto-maps status strings to colored badges.

```tsx
import { StatusBadge } from "@/components/status-badge";

<StatusBadge status={user.status} />
<StatusBadge status="ACTIVE" showDot />
<StatusBadge status="PENDING" variant="warning" />
```

Statuts mappés : `ACTIVE`, `INACTIVE`, `DRAFT`, `PENDING`, `VALIDATED`, `CANCELLED`, `PAID`, `PARTIALLY_PAID`, `SENT`, `ACCEPTED`, `REFUSED`, `EXPIRED`, `IN_PREPARATION`, `PARTIALLY_DELIVERED`, `DELIVERED`, `INVOICED`, `IN_PROGRESS`, `PARTIAL`, `PARTIALLY_RECEIVED`, `RECEIVED`, `COMPLETED`, `ENABLED`, `DISABLED`.

---

## DetailSection / DetailGrid / DetailCard / DetailSummary

Section wrapper for detail pages.

```tsx
import { DetailSection, DetailGrid, DetailItem, DetailCard, DetailSummary } from "@/components/detail-section";

<DetailSection title="Informations" description="Détails du compte" action={<Button size="sm">Modifier</Button>}>
  <DetailGrid columns={2}>
    <DetailItem label="Nom" value={user.name} />
    <DetailItem label="Email" value={user.email} />
    <DetailItem label="Rôle" value={user.role} />
    <DetailItem label="Statut" value={<StatusBadge status={user.status} />} />
  </DetailGrid>
</DetailSection>

<DetailSummary
  title="Résumé"
  items={[
    { label: "Total", value: "1 200 €", variant: "success" },
    { label: "Impayé", value: "200 €", variant: "destructive" },
  ]}
/>
```

---

## DetailTabs

Tab navigation for detail pages.

```tsx
import {
  DetailTabs,
  createOverviewTab,
  createDetailsTab,
  createHistoryTab,
} from "@/components/detail-tabs";

<DetailTabs
  tabs={[
    createOverviewTab(<OverviewContent />),
    createDetailsTab(<DetailsContent />),
    createHistoryTab(<HistoryContent />),
  ]}
  defaultValue="overview"
/>;
```

Tab factories : `createOverviewTab`, `createDetailsTab`, `createHistoryTab`, `createDocumentsTab`, `createPaymentsTab`, `createOrdersTab`, `createInvoicesTab`, `createActivityTab`.

---

## Pagination

External pagination (not tied to react-table).

```tsx
import { Pagination } from "@/components/pagination";

{
  total > 0 && (
    <Pagination
      currentPage={page}
      totalPages={Math.ceil(total / pageSize)}
      pageSize={pageSize}
      totalCount={total}
      onPageChange={setPage}
      onPageSizeChange={setPageSize} // setPageSize auto-remet la page à 1
    />
  );
}
```

---

## SingleSelect

Popover-based single select with search and optional inline create.

```tsx
import SingleSelect from "@/components/single-select";

<SingleSelect
  value={statusFilter}
  onValueChange={(v) => {
    setStatusFilter(v);
    setPage(1);
  }}
  options={[
    { value: "ACTIVE", label: "Actif" },
    { value: "INACTIVE", label: "Inactif" },
  ]}
  placeholder="Statut"
  btnClassName="min-w-28"
/>;
```

With server-side search:

```tsx
<SingleSelect
  value={value}
  onValueChange={setValue}
  onSearchChange={setQuery} // debounced 300ms
  options={searchResults}
  placeholder="Rechercher..."
  addNewLabel="Nouvel élément"
  onClickAddNew={() => setDialogOpen(true)}
  btnClassName="w-full max-w-lg"
/>
```

---

## ConfirmDialog + useConfirmDialog

```tsx
import {
  useConfirmDialog,
  confirmDialogPresets,
} from "@/components/hooks/use-confirm-dialog";

const { confirm, ConfirmDialogComponent } = useConfirmDialog();

const handleDelete = async () => {
  const ok = await confirm(confirmDialogPresets.delete("cet utilisateur"));
  if (!ok) return;
  await deleteUser.mutateAsync({ id });
};

// Toujours rendre ConfirmDialogComponent à la racine de la page
return (
  <>
    {/* ... page content ... */}
    {ConfirmDialogComponent}
  </>
);
```

Presets : `confirmDialogPresets.delete(name)`, `.cancel()`, `.archive()`, `.restore()`

---

## Bulk Actions

````tsx
import {
  executeBulkAction,
  showBulkResultToast,
} from "@/components/hooks/use-bulk-selection";
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const handleBulkDelete = async () => {
  const result = await executeBulkAction(selectedItems, (item) =>
    deleteUser.mutateAsync({ id: item.id }),
  );
  showBulkResultToast(result, "Supprimés", "Erreur de suppression");
  setSelectedItems([]);
  await queryClient.invalidateQueries({ queryKey: ["users"] });
};

---

## Form Components

Composants de formulaire génériques avec `Controller` + `Field`/`FieldLabel`/`FieldError`. Import depuis `@/components/form`.

```tsx
import {
  FormActions,
  FormTextField,
  FormTextareaField,
  FormSwitchField,
  FormCheckboxField,
  FormSelectField,
  FormDateField,
} from "@/components/form";
````

**Props communs à tous les champs** (`<T extends FieldValues>`) :

| Prop           | Type               | Notes                               |
| -------------- | ------------------ | ----------------------------------- |
| `form`         | `UseFormReturn<T>` | Instance RHF                        |
| `name`         | `Path<T>`          | Nom du champ (type-safe)            |
| `label`        | `string`           | Libellé                             |
| `required`     | `boolean`          | Affiche `*` (cosmétique uniquement) |
| `description`  | `string`           | Texte d'aide sous le champ          |
| `disabled`     | `boolean`          | Désactive le champ                  |
| `defaultValue` | valeur             | Valeur initiale                     |

### FormTextField

```tsx
<FormTextField
  form={form}
  name="email"
  label="Email"
  type="email" // "text" | "email"
  required
  disabled={isPending}
/>
```

### FormTextareaField

```tsx
<FormTextareaField
  form={form}
  name="description"
  label="Description"
  rows={4}
/>
```

### FormSwitchField / FormCheckboxField

Disposition horizontale (label + toggle sur la même ligne).

```tsx
<FormSwitchField form={form} name="isActive" label="Actif" />
<FormCheckboxField form={form} name="acceptTerms" label="J'accepte les conditions" />
```

### FormSelectField

```tsx
// Single select
<FormSelectField
  form={form}
  name="role"
  label="Rôle"
  variant="single"
  options={[
    { value: "admin", label: "Admin" },
    { value: "member", label: "Membre" },
  ]}
/>

// Multi select (badges)
<FormSelectField
  form={form}
  name="permissions"
  label="Permissions"
  variant="multi"
  options={permissionOptions}
/>
```

### FormDateField

```tsx
<FormDateField
  form={form}
  name="startDate"
  label="Date de début"
  triggerDisabled={isPending}
/>
```

> `disabled` sur `FormDateField` est un prédicat `(date: Date) => boolean` pour désactiver des dates. Utiliser `triggerDisabled` pour désactiver le bouton trigger.

### FormActions

Groupe boutons submit / annuler / reset. **Toujours en bas du formulaire.**

```tsx
<FormActions
  variant="dialog" // "page" | "dialog"
  isLoading={isPending}
  disabled={isPending}
  submitLabel={isEdit ? "Mettre à jour" : "Créer"}
  submitLoadingLabel={isEdit ? "Mise à jour..." : "Création..."}
  onCancel={onClose}
  // onReset={() => form.reset()} // optionnel
/>
```

| Prop                 | Type                 | Default               | Notes                             |
| -------------------- | -------------------- | --------------------- | --------------------------------- |
| `variant`            | `"page" \| "dialog"` | required              | `dialog` = boutons alignés droite |
| `isLoading`          | `boolean`            | `false`               | Affiche spinner sur le bouton     |
| `disabled`           | `boolean`            | `false`               |                                   |
| `submitLabel`        | `string`             | `"Enregistrer"`       |                                   |
| `submitLoadingLabel` | `string`             | `"Enregistrement..."` |                                   |
| `cancelLabel`        | `string`             | `"Annuler"`           |                                   |
| `onCancel`           | `() => void`         | required              |                                   |
| `onReset`            | `() => void`         | —                     | Affiche un bouton Réinitialiser   |
| `resetLabel`         | `string`             | `"Réinitialiser"`     |                                   |

```

```
