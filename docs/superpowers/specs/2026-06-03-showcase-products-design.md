# Spec — Module Showcase : Produits

**Date :** 2026-06-03  
**Statut :** approuvé  
**Objectif :** Créer un module exemple complet qui démontre l'utilisation de tous les composants partagés (Phase 2/3) avec des données mock. Sert de référence d'implémentation pour les agents IA et les développeurs.

---

## 1. Périmètre

- **Domaine :** Produits (showcase uniquement, pas d'API réelle)
- **Données :** Mock data en mémoire, mutations simulées avec `setTimeout(300ms)`
- **Pages :** list, detail sheet, detail page, create, edit
- **Pas de :** backend, migration DB, API client

---

## 2. Structure de fichiers

```
apps/frontend/src/
├── app/(dashboard)/showcase/
│   └── products/
│       ├── page.tsx                        # → features/showcase/products/index.tsx
│       ├── new/
│       │   └── page.tsx                    # → features/showcase/products/new-page.tsx
│       └── [productId]/
│           ├── page.tsx                    # → features/showcase/products/detail-page.tsx
│           └── edit/
│               └── page.tsx               # → features/showcase/products/edit-page.tsx
│
└── features/showcase/products/
    ├── mock-store.ts                       # Store mutable partagé (reset au rechargement)
    ├── mock-data.ts                        # 15 produits + 30 variantes initiaux
    ├── types.ts                            # Product, Variant, ProductStatus, VariantStatus
    ├── schema.ts                           # Zod schemas (createProduct, updateProduct)
    ├── hooks.ts                            # Centralised hook (state + handlers + mutations)
    ├── columns.tsx                         # Column factory buildProductColumns(handlers)
    ├── index.tsx                           # List page — thin consumer
    ├── detail-sheet.tsx                    # Slide-over panel (handlers via props)
    ├── detail-page.tsx                     # Full detail page
    ├── new-page.tsx                        # Formulaire création
    ├── edit-page.tsx                       # Formulaire édition
    └── _components/
        ├── product-select.tsx              # SingleSelect avec search debounced sur mock store
        ├── variant-table.tsx               # Embedded table des variantes
        └── category-select.tsx             # SingleSelect statique (4 catégories)
```

---

## 3. Navigation sidebar

Ajouter dans `src/components/layout/sidebar-data.ts` un groupe **"Showcase"** avec l'item :

```ts
{ title: "Produits", url: "/showcase/products", icon: PackageIcon }
```

---

## 4. Types

```ts
// types.ts
export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "OUT_OF_STOCK";
export type VariantStatus = "ACTIVE" | "INACTIVE";

export type Product = {
  id: string;
  reference: string;
  name: string;
  category: "Électronique" | "Vêtements" | "Alimentation" | "Mobilier";
  price: number; // en euros
  stock: number;
  status: ProductStatus;
  description: string;
  similarProductId?: string;
  createdAt: string; // ISO string
};

export type Variant = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: VariantStatus;
};
```

---

## 5. Mock data

**15 produits**, répartis :

- 7 `ACTIVE`, 3 `INACTIVE`, 3 `DRAFT`, 2 `OUT_OF_STOCK`
- 4 catégories : Électronique (4), Vêtements (4), Alimentation (4), Mobilier (3)
- Prix : 9.99 € – 1 299 €
- Stock : 0 – 500

**30 variantes**, 2 par produit en moyenne, statuts mixtes.

**Mock store (`mock-store.ts`)** : exporte `getProducts()`, `getVariants(productId?)`, `createProduct()`, `updateProduct()`, `deleteProduct()`. Toutes les mutations retournent `Promise<T>` avec `setTimeout(300ms)`. Les données sont modifiées dans des variables de module (`let _products`, `let _variants`) — persistantes dans la session, réinitialisées au rechargement.

---

## 6. Hook centralisé (`hooks.ts`)

Exports : `useProducts()` — retourne :

```ts
{
  // Data
  items, total, isLoading,
  // Pagination
  page, setPage, pageSize, setPageSize,
  // Filtres
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  categoryFilter, setCategoryFilter,
  // Sélection
  selectedItems, setSelectedItems,
  selectedId, setSelectedId,
  // Handlers
  handlers: {
    onView(id), onEdit(id), onDelete(id), onBulkDelete()
  },
  // Table config
  columns, searchConfig, filtersConfig, actionsConfig, bulkActionsConfig,
  // ConfirmDialog
  ConfirmDialogComponent,
}
```

Filtrage fait côté client sur le mock store (search sur nom + référence, filtre statut, filtre catégorie). Pagination simulée avec `slice`.

---

## 7. Pages

### List page (`index.tsx`)

- `BasePage` breadcrumbs : `[{ title: "Showcase" }, { title: "Produits" }]`
- `PageHeader variant="list"` + `PageHeaderActions.create("/showcase/products/new", "Nouveau produit")`
- `TableHeader` : search + filtre statut + filtre catégorie + reset
- `DataTable` selectable + `pagination={false}`
- `Pagination` séparée
- `ConfirmDialogComponent` à la racine
- `ProductDetailSheet` reçoit `handlers` via props

**Colonnes DataTable :**
| Colonne | Contenu |
|---|---|
| Référence | `ref.` texte mono |
| Nom | texte |
| Catégorie | texte |
| Prix | formaté `XX.XX €` |
| Stock | nombre, rouge si 0 |
| Statut | `StatusBadge` |
| Actions | `CellActions` : view / edit / delete |

### Detail sheet (`detail-sheet.tsx`)

- Header : nom + `StatusBadge` + bouton Modifier
- Skeleton si `isLoading`
- `DetailTabs` :
  - **Aperçu** : `DetailSection` + `DetailGrid columns={2}` (Référence, Catégorie, Prix, Stock, Description)
  - **Variantes** : `VariantTable` (embedded, reçoit `productId`)

### Detail page (`detail-page.tsx`)

- 3 états : loading (Skeleton) / error (Alert) / not-found (`notFound()`)
- `PageHeader variant="detail-card"` + `backNavigation` + `StatusBadge` + `PageHeaderActions.edit` + `PageHeaderActions.delete`
- KPI cards (3) : Prix unitaire / Stock total / Nombre de variantes
- `DetailTabs` :
  - **Informations** : `DetailSection` + `DetailGrid columns={2}`
  - **Variantes** : `VariantTable`
  - **Résumé** : `DetailSummary` avec valeur totale du stock (prix × stock), stock disponible vs épuisé

### Form pages

**`new-page.tsx`** :

- `BasePage` breadcrumbs : `[{ title: "Produits", url: "/showcase/products" }, { title: "Nouveau produit" }]`
- `PageHeader variant="create"` + `PageHeaderActions.save(onSubmit, isLoading)` + `PageHeaderActions.cancel("/showcase/products")`
- Champs : Nom*, Référence*, Catégorie* (`CategorySelect`), Prix*, Stock*, Statut* (`SingleSelect`), Description, Produit similaire (`ProductSelect`)
- React Hook Form + Zod
- Toast succès → redirect `/showcase/products`

**`edit-page.tsx`** :

- Même structure, pré-remplit le formulaire depuis le mock store
- `PageHeader variant="edit"` + titre = nom du produit

---

## 8. Composants internes

### `VariantTable` (`_components/variant-table.tsx`)

- Reçoit `productId: string`
- Charge les variantes depuis le mock store directement (pas de handler parent — les variantes sont en lecture seule dans ce showcase)
- `DataTable` avec colonnes : Nom, SKU, Prix, Stock, Statut (`StatusBadge`)
- `emptyMessage="Aucune variante."`, `pagination={false}`

### `ProductSelect` (`_components/product-select.tsx`)

- `SingleSelect` avec `onSearchChange` → filtre sur mock store (debounce 300ms via `SingleSelect`)
- Options : `{ value: product.id, label: "${product.name} (${product.reference})" }`
- Exclut le produit courant si `excludeId` fourni
- Pas de "créer inline" (trop complexe pour un showcase)

### `CategorySelect` (`_components/category-select.tsx`)

- `SingleSelect` statique, 4 options fixes
- `placeholder="Catégorie"`

---

## 9. Composants couverts (checklist)

| Composant                                                                       | Où                               |
| ------------------------------------------------------------------------------- | -------------------------------- |
| `BasePage`                                                                      | Toutes les pages                 |
| `PageHeader` (list, detail, detail-card, create, edit)                          | List, detail, new, edit          |
| `PageHeaderActions` (create, edit, save, cancel, delete)                        | Toutes les pages                 |
| `TableHeader` + `createSearchField` + `createFilterField` + `createResetButton` | List                             |
| `createBulkActions`                                                             | List (bulk delete)               |
| `DataTable` (selectable, pagination=false, emptyMessage)                        | List + VariantTable              |
| `Pagination`                                                                    | List                             |
| `CellActions` + factories (view, edit, delete)                                  | List columns                     |
| `StatusBadge` (4 statuts produit + 2 statuts variante)                          | List, sheet, detail              |
| `DetailSection` + `DetailGrid` + `DetailItem`                                   | Sheet, detail                    |
| `DetailSummary`                                                                 | Detail (onglet Résumé)           |
| `DetailTabs` + factories (overview, details, history)                           | Sheet, detail                    |
| `SingleSelect` (statique + search)                                              | List filtres, form               |
| `ConfirmDialog` + `useConfirmDialog` + presets                                  | hooks.ts                         |
| `executeBulkAction` + `showBulkResultToast`                                     | hooks.ts                         |
| `ProductSelect` (entity-select pattern)                                         | Form new + edit                  |
| Embedded table pattern                                                          | VariantTable dans sheet + detail |

---

## 10. Contraintes

- `"use client"` sur tous les fichiers features
- Icônes uniquement via `@/lib/icons` + `Icon`
- Labels, toasts, messages en français
- Aucun appel API réel — tout depuis `mock-store.ts`
- Le mock store n'utilise pas `localStorage` — reset au rechargement de page est acceptable
