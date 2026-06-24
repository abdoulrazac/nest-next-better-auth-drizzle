# URL Table Params — Design Spec

**Date:** 2026-06-05  
**Status:** Approved

## Objectif

Synchroniser les paramètres de recherche, filtres et pagination des pages liste avec l'URL via `nuqs`. Cela permet la navigation retour/avant, le partage d'URL et la conservation de l'état à la navigation.

---

## Décisions clés

| Décision                          | Valeur                                                            |
| --------------------------------- | ----------------------------------------------------------------- |
| Librairie URL state               | `nuqs`                                                            |
| Mise à jour URL pour la recherche | Submit seulement (Enter ou bouton)                                |
| History mode                      | `push` pour tous les changements (recherche, filtres, pagination) |
| Reset page                        | Automatique sur tout changement de search, filtre, pageSize       |

---

## Architecture

### Pièces à créer / modifier

| Fichier                                         | Action    | Description                        |
| ----------------------------------------------- | --------- | ---------------------------------- |
| `apps/frontend/package.json`                    | Modifier  | Ajouter `nuqs`                     |
| `apps/frontend/src/app/providers.tsx`           | Modifier  | Ajouter `NuqsAdapter`              |
| `apps/frontend/src/hooks/use-table-params.ts`   | **Créer** | Hook générique URL state           |
| `apps/frontend/src/components/table-header.tsx` | Modifier  | SearchField submit-on-Enter/button |
| `features/showcase/products/hooks.tsx`          | Migrer    | useState → useTableParams          |
| `features/users/index.tsx`                      | Migrer    | useState → useTableParams          |
| `features/roles/index.tsx`                      | Migrer    | useState → useTableParams          |

---

## Hook `useTableParams`

**Fichier :** `apps/frontend/src/hooks/use-table-params.ts`

```ts
interface TableParamsConfig {
  filterKeys?: string[]; // clés URL pour les filtres (ex: ["status", "category"])
  defaultPageSize?: number; // défaut: 10
}

const {
  search,
  setSearch,
  getFilter,
  setFilter,
  page,
  setPage,
  pageSize,
  setPageSize,
  resetFilters,
} = useTableParams({ filterKeys: ["status", "category"], defaultPageSize: 10 });
```

### Comportement

- Utilise `useQueryStates` de nuqs avec `history: 'push'`
- `setSearch(v)` → met `search=v` et `page=1`
- `setFilter(key, v)` → met `[key]=v` et `page=1`
- `setPageSize(n)` → met `pageSize=n` et `page=1`
- `setPage(n)` → met `page=n` seulement
- `resetFilters()` → remet `search=""`, tous les filtres à `""`, `page=1`
- `getFilter(key)` → retourne la valeur du filtre ou `""` par défaut

### Format URL

```
?search=laptop&status=ACTIVE&category=Électronique&page=2&pageSize=20
```

Paramètres absents = valeur par défaut (pas d'écriture dans l'URL pour les defaults).

---

## Modification `TableHeader` — champ recherche

### Interface `SearchField` (avant → après)

```ts
// Avant
interface SearchField {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Après
interface SearchField {
  value: string; // valeur URL (committed)
  onSearch: (value: string) => void; // appelé sur submit seulement
  placeholder?: string;
}
```

### Comportement du composant

- L'input maintient un **état local** pour la saisie en cours
- `onSearch` est appelé uniquement sur :
  - Clic sur le **bouton loupe** (à droite de l'input)
  - Touche **Enter**
- Quand `value` change (navigation retour/avant), l'input se resynchronise via `useEffect`

### UI du champ recherche

```tsx
<div className="flex">
  <Input
    value={localValue}
    onChange={(e) => setLocalValue(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleSubmit();
    }}
    placeholder={search.placeholder}
    className="rounded-r-none"
  />
  <Button
    variant="outline"
    onClick={handleSubmit}
    className="rounded-l-none border-l-0"
  >
    <Icon icon={SearchIcon} className="h-4 w-4" />
  </Button>
</div>
```

### Factory `createSearchField` (renommage)

```ts
// Avant
createSearchField(value, onChange, opts?)

// Après
createSearchField(value, onSearch, opts?)
```

---

## Migration des features

### Pattern avant

```ts
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

// Dans createSearchField :
createSearchField(searchTerm, (v) => { setSearchTerm(v); setPage(1); })

// Dans createFilterField :
onValueChange={(v) => { setStatusFilter(v); setPage(1); }}

// Dans createResetButton :
onClick={() => { setSearchTerm(""); setStatusFilter(""); setPage(1); }
```

### Pattern après

```ts
const { search, setSearch, getFilter, setFilter,
        page, setPage, pageSize, setPageSize, resetFilters } =
  useTableParams({ filterKeys: ["status"] });

// Dans createSearchField :
createSearchField(search, setSearch)

// Dans createFilterField :
onValueChange={(v) => setFilter("status", v)}

// Dans createResetButton :
onClick={resetFilters}
```

### Features à migrer

| Feature                       | filterKeys               | Notes                |
| ----------------------------- | ------------------------ | -------------------- |
| `showcase/products/hooks.tsx` | `["status", "category"]` | State dans le hook   |
| `features/users/index.tsx`    | `["status"]`             | State dans index.tsx |
| `features/roles/index.tsx`    | `[]`                     | Search seulement     |

---

## NuqsAdapter

Doit être ajouté une seule fois dans `apps/frontend/src/app/providers.tsx` (ou `layout.tsx`) :

```tsx
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }) {
  return <NuqsAdapter>{/* autres providers */}</NuqsAdapter>;
}
```

---

## Hors périmètre

- Tri (`sorting`) — reste interne à TanStack Table, pas dans l'URL
- Visibilité des colonnes — reste interne à TanStack Table
- Sélection de lignes — état éphémère, pas dans l'URL
- État `expanded` des lignes — pas dans l'URL
