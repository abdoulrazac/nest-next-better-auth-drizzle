# Showcase Products — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un module Produits complet avec données mock qui démontre l'utilisation de tous les composants partagés (BasePage, PageHeader, TableHeader, DataTable, CellActions, StatusBadge, DetailSection, DetailTabs, Pagination, SingleSelect, ConfirmDialog, embedded table).

**Architecture:** Hook centralisé (`hooks.ts`) propriétaire de toutes les mutations/handlers/state, alimenté par un mock store en mémoire. Pages thin consumers. DetailSheet et detail page consomment les composants partagés. Pattern TanStack Query avec queryFn mockées.

**Tech Stack:** Next.js App Router, React, TanStack Query, React Hook Form, Zod, sonner, Tailwind CSS, HugeIcons, composants partagés Phase 2/3.

---

## Fichiers créés / modifiés

```
MODIFY  apps/frontend/src/components/layout/sidebar-data.ts
CREATE  apps/frontend/src/features/showcase/products/types.ts
CREATE  apps/frontend/src/features/showcase/products/mock-store.ts
CREATE  apps/frontend/src/features/showcase/products/mock-data.ts
CREATE  apps/frontend/src/features/showcase/products/schema.ts
CREATE  apps/frontend/src/features/showcase/products/hooks.ts
CREATE  apps/frontend/src/features/showcase/products/columns.tsx
CREATE  apps/frontend/src/features/showcase/products/_components/category-select.tsx
CREATE  apps/frontend/src/features/showcase/products/_components/product-select.tsx
CREATE  apps/frontend/src/features/showcase/products/_components/variant-table.tsx
CREATE  apps/frontend/src/features/showcase/products/detail-sheet.tsx
CREATE  apps/frontend/src/features/showcase/products/index.tsx
CREATE  apps/frontend/src/features/showcase/products/detail-page.tsx
CREATE  apps/frontend/src/features/showcase/products/new-page.tsx
CREATE  apps/frontend/src/features/showcase/products/edit-page.tsx
CREATE  apps/frontend/src/app/(dashboard)/showcase/products/page.tsx
CREATE  apps/frontend/src/app/(dashboard)/showcase/products/new/page.tsx
CREATE  apps/frontend/src/app/(dashboard)/showcase/products/[productId]/page.tsx
CREATE  apps/frontend/src/app/(dashboard)/showcase/products/[productId]/edit/page.tsx
```

---

## Task 1 — Types, mock store, mock data

**Files:**

- Create: `apps/frontend/src/features/showcase/products/types.ts`
- Create: `apps/frontend/src/features/showcase/products/mock-data.ts`
- Create: `apps/frontend/src/features/showcase/products/mock-store.ts`

- [ ] **Créer le dossier**

```bash
mkdir -p apps/frontend/src/features/showcase/products/_components
mkdir -p apps/frontend/src/app/\(dashboard\)/showcase/products/new
mkdir -p "apps/frontend/src/app/(dashboard)/showcase/products/[productId]/edit"
```

- [ ] **Créer `types.ts`**

```ts
// apps/frontend/src/features/showcase/products/types.ts

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "OUT_OF_STOCK";
export type VariantStatus = "ACTIVE" | "INACTIVE";
export type ProductCategory =
  | "Électronique"
  | "Vêtements"
  | "Alimentation"
  | "Mobilier";

export interface Product {
  id: string;
  reference: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  description: string;
  similarProductId?: string;
  createdAt: string; // ISO string
}

export interface Variant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: VariantStatus;
}

export interface ProductFormValues {
  name: string;
  reference: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  description: string;
  similarProductId?: string;
}
```

- [ ] **Créer `mock-data.ts`**

```ts
// apps/frontend/src/features/showcase/products/mock-data.ts
import type { Product, Variant } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_01",
    reference: "ELEC-001",
    name: "Laptop Pro 15",
    category: "Électronique",
    price: 1299,
    stock: 42,
    status: "ACTIVE",
    description:
      "Laptop haute performance 15 pouces, Core i7, 16 Go RAM, SSD 512 Go.",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "prod_02",
    reference: "ELEC-002",
    name: "Écran 4K 27 pouces",
    category: "Électronique",
    price: 449,
    stock: 18,
    status: "ACTIVE",
    description:
      "Moniteur 4K UHD 27 pouces, 144 Hz, HDR400, temps de réponse 1 ms.",
    createdAt: "2024-01-20T08:30:00Z",
  },
  {
    id: "prod_03",
    reference: "ELEC-003",
    name: "Casque Audio Sans Fil",
    category: "Électronique",
    price: 189,
    stock: 0,
    status: "OUT_OF_STOCK",
    description:
      "Casque Bluetooth 5.0, autonomie 30h, réduction de bruit active.",
    createdAt: "2024-02-01T12:00:00Z",
  },
  {
    id: "prod_04",
    reference: "ELEC-004",
    name: "Clavier Mécanique RGB",
    category: "Électronique",
    price: 129,
    stock: 65,
    status: "ACTIVE",
    description:
      "Clavier mécanique TKL, switches Cherry MX Red, rétroéclairage RGB.",
    similarProductId: "prod_01",
    createdAt: "2024-02-10T09:00:00Z",
  },
  {
    id: "prod_05",
    reference: "VET-001",
    name: "T-shirt Col Rond Premium",
    category: "Vêtements",
    price: 29.99,
    stock: 200,
    status: "ACTIVE",
    description:
      "T-shirt 100% coton biologique, coupe regular, disponible en 5 coloris.",
    createdAt: "2024-02-15T14:00:00Z",
  },
  {
    id: "prod_06",
    reference: "VET-002",
    name: "Jean Slim Stretch",
    category: "Vêtements",
    price: 79.99,
    stock: 150,
    status: "ACTIVE",
    description:
      "Jean slim coupe moderne, tissu stretch 98% coton 2% élasthanne.",
    createdAt: "2024-02-20T11:00:00Z",
  },
  {
    id: "prod_07",
    reference: "VET-003",
    name: "Veste en Cuir",
    category: "Vêtements",
    price: 249,
    stock: 30,
    status: "INACTIVE",
    description: "Veste en cuir véritable, doublure en soie, col mao.",
    createdAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "prod_08",
    reference: "VET-004",
    name: "Robe Midi Fleurie",
    category: "Vêtements",
    price: 59.99,
    stock: 0,
    status: "OUT_OF_STOCK",
    description:
      "Robe midi imprimé floral, tissu viscose légère, idéale pour l'été.",
    createdAt: "2024-03-05T09:30:00Z",
  },
  {
    id: "prod_09",
    reference: "ALI-001",
    name: "Café Arabica Bio 500g",
    category: "Alimentation",
    price: 14.99,
    stock: 500,
    status: "ACTIVE",
    description:
      "Café arabica 100% biologique, torréfaction artisanale, notes de chocolat.",
    createdAt: "2024-03-10T08:00:00Z",
  },
  {
    id: "prod_10",
    reference: "ALI-002",
    name: "Huile d'Olive Extra Vierge 1L",
    category: "Alimentation",
    price: 19.99,
    stock: 300,
    status: "ACTIVE",
    description:
      "Huile d'olive première pression à froid, AOP Provence, bouteille en verre.",
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "prod_11",
    reference: "ALI-003",
    name: "Miel de Lavande 250g",
    category: "Alimentation",
    price: 9.99,
    stock: 120,
    status: "DRAFT",
    description:
      "Miel de lavande artisanal, récolte de Provence, pot en verre.",
    createdAt: "2024-03-20T11:00:00Z",
  },
  {
    id: "prod_12",
    reference: "ALI-004",
    name: "Thé Vert Sencha Bio 100g",
    category: "Alimentation",
    price: 11.99,
    stock: 80,
    status: "INACTIVE",
    description:
      "Thé vert japonais Sencha certifié bio, saveur douce et végétale.",
    createdAt: "2024-03-25T12:00:00Z",
  },
  {
    id: "prod_13",
    reference: "MOB-001",
    name: "Bureau Ergonomique Réglable",
    category: "Mobilier",
    price: 599,
    stock: 12,
    status: "ACTIVE",
    description:
      "Bureau assis-debout électrique, plateau 140x70cm, mémorisation 3 hauteurs.",
    createdAt: "2024-04-01T09:00:00Z",
  },
  {
    id: "prod_14",
    reference: "MOB-002",
    name: "Chaise de Bureau Pro",
    category: "Mobilier",
    price: 399,
    stock: 25,
    status: "DRAFT",
    description:
      "Chaise ergonomique lombaire réglable, accoudoirs 4D, tissu respirant.",
    similarProductId: "prod_13",
    createdAt: "2024-04-05T10:00:00Z",
  },
  {
    id: "prod_15",
    reference: "MOB-003",
    name: "Étagère Bibliothèque 5 Niveaux",
    category: "Mobilier",
    price: 149,
    stock: 40,
    status: "DRAFT",
    description:
      "Bibliothèque en bois massif, 5 niveaux ajustables, finition chêne clair.",
    createdAt: "2024-04-10T11:00:00Z",
  },
];

export const INITIAL_VARIANTS: Variant[] = [
  // Laptop Pro 15
  {
    id: "var_01",
    productId: "prod_01",
    name: '15"',
    sku: "LP15-I7-16-512",
    price: 1299,
    stock: 25,
    status: "ACTIVE",
  },
  {
    id: "var_02",
    productId: "prod_01",
    name: '17"',
    sku: "LP17-I7-32-1TB",
    price: 1599,
    stock: 17,
    status: "ACTIVE",
  },
  // Écran 4K
  {
    id: "var_03",
    productId: "prod_02",
    name: '27" Mat',
    sku: "MON27-4K-MAT",
    price: 449,
    stock: 10,
    status: "ACTIVE",
  },
  {
    id: "var_04",
    productId: "prod_02",
    name: '32" Brillant',
    sku: "MON32-4K-GLO",
    price: 549,
    stock: 8,
    status: "ACTIVE",
  },
  // Casque Audio
  {
    id: "var_05",
    productId: "prod_03",
    name: "Noir",
    sku: "HEAD-BLK-BT5",
    price: 189,
    stock: 0,
    status: "INACTIVE",
  },
  {
    id: "var_06",
    productId: "prod_03",
    name: "Blanc",
    sku: "HEAD-WHT-BT5",
    price: 189,
    stock: 0,
    status: "INACTIVE",
  },
  // Clavier
  {
    id: "var_07",
    productId: "prod_04",
    name: "Red Switch",
    sku: "KB-TKL-RED-RGB",
    price: 129,
    stock: 40,
    status: "ACTIVE",
  },
  {
    id: "var_08",
    productId: "prod_04",
    name: "Brown Switch",
    sku: "KB-TKL-BRN-RGB",
    price: 129,
    stock: 25,
    status: "ACTIVE",
  },
  // T-shirt
  {
    id: "var_09",
    productId: "prod_05",
    name: "S",
    sku: "TS-CR-S",
    price: 29.99,
    stock: 60,
    status: "ACTIVE",
  },
  {
    id: "var_10",
    productId: "prod_05",
    name: "M",
    sku: "TS-CR-M",
    price: 29.99,
    stock: 80,
    status: "ACTIVE",
  },
  {
    id: "var_11",
    productId: "prod_05",
    name: "L",
    sku: "TS-CR-L",
    price: 29.99,
    stock: 60,
    status: "ACTIVE",
  },
  // Jean Slim
  {
    id: "var_12",
    productId: "prod_06",
    name: "32/32",
    sku: "JN-SLM-32-32",
    price: 79.99,
    stock: 50,
    status: "ACTIVE",
  },
  {
    id: "var_13",
    productId: "prod_06",
    name: "34/32",
    sku: "JN-SLM-34-32",
    price: 79.99,
    stock: 50,
    status: "ACTIVE",
  },
  {
    id: "var_14",
    productId: "prod_06",
    name: "36/34",
    sku: "JN-SLM-36-34",
    price: 79.99,
    stock: 50,
    status: "ACTIVE",
  },
  // Veste Cuir
  {
    id: "var_15",
    productId: "prod_07",
    name: "M",
    sku: "VJ-LTH-M",
    price: 249,
    stock: 15,
    status: "INACTIVE",
  },
  {
    id: "var_16",
    productId: "prod_07",
    name: "L",
    sku: "VJ-LTH-L",
    price: 249,
    stock: 15,
    status: "INACTIVE",
  },
  // Robe Midi
  {
    id: "var_17",
    productId: "prod_08",
    name: "S",
    sku: "DR-MDI-S",
    price: 59.99,
    stock: 0,
    status: "INACTIVE",
  },
  {
    id: "var_18",
    productId: "prod_08",
    name: "M",
    sku: "DR-MDI-M",
    price: 59.99,
    stock: 0,
    status: "INACTIVE",
  },
  // Café Arabica
  {
    id: "var_19",
    productId: "prod_09",
    name: "Moutu",
    sku: "CF-ARA-GRD",
    price: 14.99,
    stock: 250,
    status: "ACTIVE",
  },
  {
    id: "var_20",
    productId: "prod_09",
    name: "En grains",
    sku: "CF-ARA-BEA",
    price: 14.99,
    stock: 250,
    status: "ACTIVE",
  },
  // Huile d'Olive
  {
    id: "var_21",
    productId: "prod_10",
    name: "1L",
    sku: "OLV-EXV-1L",
    price: 19.99,
    stock: 200,
    status: "ACTIVE",
  },
  {
    id: "var_22",
    productId: "prod_10",
    name: "500ml",
    sku: "OLV-EXV-500",
    price: 11.99,
    stock: 100,
    status: "ACTIVE",
  },
  // Miel
  {
    id: "var_23",
    productId: "prod_11",
    name: "Jar 250g",
    sku: "HON-LAV-250",
    price: 9.99,
    stock: 120,
    status: "ACTIVE",
  },
  {
    id: "var_24",
    productId: "prod_11",
    name: "Jar 500g",
    sku: "HON-LAV-500",
    price: 17.99,
    stock: 0,
    status: "INACTIVE",
  },
  // Thé Vert
  {
    id: "var_25",
    productId: "prod_12",
    name: "Vrac 100g",
    sku: "TEA-SEN-100",
    price: 11.99,
    stock: 80,
    status: "INACTIVE",
  },
  // Bureau
  {
    id: "var_26",
    productId: "prod_13",
    name: "140x70 cm",
    sku: "DSK-ERG-140",
    price: 599,
    stock: 8,
    status: "ACTIVE",
  },
  {
    id: "var_27",
    productId: "prod_13",
    name: "160x80 cm",
    sku: "DSK-ERG-160",
    price: 699,
    stock: 4,
    status: "ACTIVE",
  },
  // Chaise
  {
    id: "var_28",
    productId: "prod_14",
    name: "Tissu Gris",
    sku: "CHR-PRO-GRY",
    price: 399,
    stock: 15,
    status: "ACTIVE",
  },
  {
    id: "var_29",
    productId: "prod_14",
    name: "Tissu Noir",
    sku: "CHR-PRO-BLK",
    price: 399,
    stock: 10,
    status: "ACTIVE",
  },
  // Étagère
  {
    id: "var_30",
    productId: "prod_15",
    name: "Chêne Clair",
    sku: "SHF-5L-OAK",
    price: 149,
    stock: 25,
    status: "ACTIVE",
  },
];
```

- [ ] **Créer `mock-store.ts`**

```ts
// apps/frontend/src/features/showcase/products/mock-store.ts
import { INITIAL_PRODUCTS, INITIAL_VARIANTS } from "./mock-data";
import type { Product, Variant, ProductFormValues } from "./types";

// Variables mutables — reset au rechargement
let _products: Product[] = [...INITIAL_PRODUCTS];
let _variants: Variant[] = [...INITIAL_VARIANTS];

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Products ──────────────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  return _products;
}

export function getProductById(id: string): Product | undefined {
  return _products.find((p) => p.id === id);
}

export async function createProduct(
  values: ProductFormValues,
): Promise<Product> {
  await delay();
  const product: Product = {
    ...values,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  _products = [product, ..._products];
  return product;
}

export async function updateProduct(
  id: string,
  values: Partial<ProductFormValues>,
): Promise<Product> {
  await delay();
  const idx = _products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Produit ${id} introuvable`);
  const updated = { ..._products[idx], ...values };
  _products = _products.map((p) => (p.id === id ? updated : p));
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  await delay();
  _products = _products.filter((p) => p.id !== id);
  _variants = _variants.filter((v) => v.productId !== id);
}

// ── Variants ──────────────────────────────────────────────────────────────────

export function getVariantsByProductId(productId: string): Variant[] {
  return _variants.filter((v) => v.productId === productId);
}
```

- [ ] **Commit**

```bash
cd apps/frontend && git add src/features/showcase/products/types.ts src/features/showcase/products/mock-data.ts src/features/showcase/products/mock-store.ts
git commit -m "feat(showcase): add product types, mock data and mock store"
```

---

## Task 2 — Sidebar navigation

**Files:**

- Modify: `apps/frontend/src/components/layout/sidebar-data.ts`

- [ ] **Ajouter le groupe Showcase dans `sidebar-data.ts`**

Ajouter l'import `BriefcaseIcon` (déjà disponible) et insérer un nouveau `navGroup` avant `"Paramètres"` :

```ts
// En haut du fichier, ajouter BriefcaseIcon aux imports existants :
import {
  BellIcon,
  BriefcaseIcon, // ← ajouter
  DashboardIcon,
  DocumentIcon,
  FileIcon,
  SettingsIcon,
  ShieldUserIcon,
  TagIcon,
  UsersIcon,
  WebhookIcon,
} from "@/lib/icons";
```

Puis dans `sidebarData.navGroups`, ajouter avant l'objet `{ title: "Paramètres", ... }` :

```ts
{
  title: "Showcase",
  items: [
    {
      title: "Produits",
      url: "/showcase/products",
      icon: BriefcaseIcon,
    },
  ],
},
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/layout/sidebar-data.ts
git commit -m "feat(showcase): add sidebar navigation entry"
```

---

## Task 3 — Centralised hook (`hooks.ts`)

**Files:**

- Create: `apps/frontend/src/features/showcase/products/hooks.ts`

- [ ] **Créer `hooks.ts`**

```ts
// apps/frontend/src/features/showcase/products/hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { TrashIcon } from "@/lib/icons";
import {
  useConfirmDialog,
  confirmDialogPresets,
} from "@/components/hooks/use-confirm-dialog";
import {
  executeBulkAction,
  showBulkResultToast,
} from "@/components/hooks/use-bulk-selection";
import {
  createSearchField,
  createFilterField,
  createResetButton,
  createBulkActions,
} from "@/components/table-header";
import SingleSelect from "@/components/single-select";
import * as mockStore from "./mock-store";
import { buildProductColumns } from "./columns";
import type { Product, ProductCategory, ProductStatus } from "./types";

// ── Query keys ─────────────────────────────────────────────────────────────────
export const productKeys = {
  all: ["showcase-products"] as const,
  list: (params: object) => [...productKeys.all, "list", params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

// ── Handler type ───────────────────────────────────────────────────────────────
export type ProductHandlers = {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onBulkDelete: () => Promise<void>;
};

// ── Main hook ──────────────────────────────────────────────────────────────────
export function useProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Data — TanStack Query avec queryFn mockée
  const { data, isLoading, error } = useQuery({
    queryKey: productKeys.list({ page, pageSize, searchTerm, statusFilter, categoryFilter }),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const all = mockStore.getProducts();
      const filtered = all.filter((p) => {
        const q = searchTerm.toLowerCase();
        const matchSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q);
        const matchStatus = !statusFilter || p.status === statusFilter;
        const matchCategory = !categoryFilter || p.category === categoryFilter;
        return matchSearch && matchStatus && matchCategory;
      });
      const total = filtered.length;
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);
      return { items, total };
    },
    staleTime: 0,
  });

  const items: Product[] = data?.items ?? [];
  const total: number = data?.total ?? 0;

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockStore.deleteProduct(id),
    onSuccess: () => {
      toast.success("Produit supprimé");
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  // Handlers
  const handlers: ProductHandlers = useMemo(
    () => ({
      onView: (id: string) => setSelectedId(id),
      onEdit: (id: string) =>
        router.push(`/showcase/products/${id}/edit`),
      onDelete: async (id: string) => {
        const product = mockStore.getProductById(id);
        const ok = await confirm(
          confirmDialogPresets.delete(`"${product?.name ?? id}"`),
        );
        if (!ok) return;
        await deleteMutation.mutateAsync(id);
      },
      onBulkDelete: async () => {
        const ok = await confirm(
          confirmDialogPresets.delete(`${selectedItems.length} produit(s)`),
        );
        if (!ok) return;
        const result = await executeBulkAction(selectedItems, (item) =>
          mockStore.deleteProduct(item.id),
        );
        showBulkResultToast(result, "Produits supprimés", "Erreur de suppression");
        setSelectedItems([]);
        void queryClient.invalidateQueries({ queryKey: productKeys.all });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItems],
  );

  // Table config
  const columns = useMemo(() => buildProductColumns(handlers), [handlers]);

  const searchConfig = createSearchField(
    searchTerm,
    (v) => { setSearchTerm(v); setPage(1); },
    { placeholder: "Rechercher un produit..." },
  );

  const filtersConfig = [
    createFilterField(
      "status",
      <SingleSelect
        value={statusFilter}
        onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
        options={[
          { value: "ACTIVE", label: "Actif" },
          { value: "INACTIVE", label: "Inactif" },
          { value: "DRAFT", label: "Brouillon" },
          { value: "OUT_OF_STOCK", label: "Rupture" },
        ]}
        placeholder="Statut"
        btnClassName="min-w-32"
      />,
    ),
    createFilterField(
      "category",
      <SingleSelect
        value={categoryFilter}
        onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}
        options={[
          { value: "Électronique", label: "Électronique" },
          { value: "Vêtements", label: "Vêtements" },
          { value: "Alimentation", label: "Alimentation" },
          { value: "Mobilier", label: "Mobilier" },
        ]}
        placeholder="Catégorie"
        btnClassName="min-w-36"
      />,
    ),
  ];

  const actionsConfig = [
    createResetButton(() => {
      setSearchTerm("");
      setStatusFilter("");
      setCategoryFilter("");
      setPage(1);
    }),
  ];

  const bulkActionsConfig =
    selectedItems.length > 0
      ? createBulkActions(
          selectedItems.length,
          [
            {
              label: "Supprimer",
              icon: <Icon icon={TrashIcon} className="h-4 w-4" />,
              onClick: handlers.onBulkDelete,
              variant: "destructive",
            },
          ],
          { onClose: () => setSelectedItems([]) },
        )
      : undefined;

  return {
    items,
    total,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedItems,
    setSelectedItems,
    selectedId,
    setSelectedId,
    handlers,
    columns,
    searchConfig,
    filtersConfig,
    actionsConfig,
    bulkActionsConfig,
    ConfirmDialogComponent,
  };
}
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/showcase/products/hooks.ts
git commit -m "feat(showcase): add centralised products hook"
```

---

## Task 4 — Column factory (`columns.tsx`)

**Files:**

- Create: `apps/frontend/src/features/showcase/products/columns.tsx`

- [ ] **Créer `columns.tsx`**

```tsx
// apps/frontend/src/features/showcase/products/columns.tsx
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import CellActions, {
  createViewAction,
  createEditAction,
  createAction,
} from "@/components/cell-actions";
import { StatusBadge } from "@/components/status-badge";
import { Icon } from "@/components/ui/icon";
import { TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Product } from "./types";
import type { ProductHandlers } from "./hooks";

export function buildProductColumns(
  handlers: ProductHandlers,
): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "reference",
      header: "Référence",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.reference}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Catégorie",
    },
    {
      accessorKey: "price",
      header: "Prix",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <span
          className={cn(
            "tabular-nums font-medium",
            row.original.stock === 0 && "text-destructive",
          )}
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <CellActions
            visibleActions={2}
            actions={[
              createViewAction(() => handlers.onView(id)),
              createEditAction(() => handlers.onEdit(id)),
              // createAction without confirmDialog — la confirmation est centralisée dans hooks.ts
              createAction(
                <Icon icon={TrashIcon} className="h-4 w-4" />,
                () => handlers.onDelete(id),
                {
                  tooltip: "Supprimer",
                  variant: "destructive",
                  className: "bg-background border-none",
                },
              ),
            ]}
          />
        );
      },
    },
  ];
}
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/showcase/products/columns.tsx
git commit -m "feat(showcase): add product column factory"
```

---

## Task 5 — Composants internes (`_components/`)

**Files:**

- Create: `apps/frontend/src/features/showcase/products/_components/category-select.tsx`
- Create: `apps/frontend/src/features/showcase/products/_components/product-select.tsx`

- [ ] **Créer `category-select.tsx`**

```tsx
// apps/frontend/src/features/showcase/products/_components/category-select.tsx
"use client";

import SingleSelect from "@/components/single-select";
import type { ProductCategory } from "../types";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "Électronique", label: "Électronique" },
  { value: "Vêtements", label: "Vêtements" },
  { value: "Alimentation", label: "Alimentation" },
  { value: "Mobilier", label: "Mobilier" },
];

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onValueChange,
  disabled,
}: CategorySelectProps) {
  return (
    <SingleSelect
      value={value}
      onValueChange={onValueChange}
      options={CATEGORIES}
      placeholder="Sélectionner une catégorie"
      disabled={disabled}
      btnClassName="w-full"
    />
  );
}
```

- [ ] **Créer `product-select.tsx`**

```tsx
// apps/frontend/src/features/showcase/products/_components/product-select.tsx
"use client";

import SingleSelect from "@/components/single-select";
import { useState } from "react";
import * as mockStore from "../mock-store";

interface ProductSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  excludeId?: string; // exclure le produit courant (édition)
  disabled?: boolean;
}

export function ProductSelect({
  value,
  onValueChange,
  excludeId,
  disabled,
}: ProductSelectProps) {
  const [query, setQuery] = useState("");

  const allProducts = mockStore.getProducts();
  const filtered = allProducts.filter((p) => {
    if (excludeId && p.id === excludeId) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q)
    );
  });

  const options = filtered.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.reference})`,
  }));

  return (
    <SingleSelect
      value={value}
      onValueChange={onValueChange}
      onSearchChange={setQuery}
      options={options}
      placeholder="Rechercher un produit similaire..."
      emptyMessage="Aucun produit trouvé"
      disabled={disabled}
      btnClassName="w-full"
    />
  );
}
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/showcase/products/_components/
git commit -m "feat(showcase): add category-select and product-select components"
```

---

## Task 6 — VariantTable (`_components/variant-table.tsx`)

**Files:**

- Create: `apps/frontend/src/features/showcase/products/_components/variant-table.tsx`

- [ ] **Créer `variant-table.tsx`**

```tsx
// apps/frontend/src/features/showcase/products/_components/variant-table.tsx
"use client";

import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/status-badge";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import * as mockStore from "../mock-store";
import type { Variant } from "../types";

const VARIANT_COLUMNS: ColumnDef<Variant>[] = [
  {
    accessorKey: "name",
    header: "Variante",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.sku}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "Prix",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.price.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        })}
      </span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span
        className={cn(
          "tabular-nums font-medium",
          row.original.stock === 0 && "text-destructive",
        )}
      >
        {row.original.stock}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

interface VariantTableProps {
  productId: string;
}

export function VariantTable({ productId }: VariantTableProps) {
  const variants = mockStore.getVariantsByProductId(productId);

  return (
    <DataTable
      columns={VARIANT_COLUMNS}
      data={variants}
      pagination={false}
      emptyMessage="Aucune variante pour ce produit."
    />
  );
}
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/showcase/products/_components/variant-table.tsx
git commit -m "feat(showcase): add variant table embedded component"
```

---

## Task 7 — Detail sheet (`detail-sheet.tsx`)

**Files:**

- Create: `apps/frontend/src/features/showcase/products/detail-sheet.tsx`

- [ ] **Créer `detail-sheet.tsx`**

```tsx
// apps/frontend/src/features/showcase/products/detail-sheet.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import {
  DetailSection,
  DetailGrid,
  DetailItem,
} from "@/components/detail-section";
import {
  DetailTabs,
  createOverviewTab,
  createDetailsTab,
} from "@/components/detail-tabs";
import { EditIcon, ExternalLinkIcon } from "@/lib/icons";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { VariantTable } from "./_components/variant-table";
import * as mockStore from "./mock-store";
import { productKeys } from "./hooks";
import type { ProductHandlers } from "./hooks";

interface ProductDetailSheetProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handlers: ProductHandlers;
}

export function ProductDetailSheet({
  productId,
  open,
  onOpenChange,
  handlers,
}: ProductDetailSheetProps) {
  const router = useRouter();

  const { data: product, isLoading } = useQuery({
    queryKey: productKeys.detail(productId ?? ""),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return mockStore.getProductById(productId!) ?? null;
    },
    enabled: open && !!productId,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <div className="flex items-center justify-between gap-2 pr-6">
              <div className="flex items-center gap-2 min-w-0">
                <SheetTitle className="truncate">{product?.name}</SheetTitle>
                {product && <StatusBadge status={product.status} />}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/showcase/products/${productId}`);
                  }}
                  title="Voir la fiche complète"
                >
                  <Icon icon={ExternalLinkIcon} className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    if (productId) handlers.onEdit(productId);
                  }}
                >
                  <Icon icon={EditIcon} className="h-4 w-4" />
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : product ? (
          <div className="p-6">
            <DetailTabs
              tabs={[
                createOverviewTab(
                  <DetailSection title="Informations">
                    <DetailGrid columns={2}>
                      <DetailItem label="Référence" value={product.reference} />
                      <DetailItem label="Catégorie" value={product.category} />
                      <DetailItem
                        label="Prix"
                        value={product.price.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      />
                      <DetailItem
                        label="Stock"
                        value={
                          <span
                            className={
                              product.stock === 0
                                ? "text-destructive font-medium"
                                : undefined
                            }
                          >
                            {product.stock} unité(s)
                          </span>
                        }
                      />
                      <DetailItem
                        label="Statut"
                        value={<StatusBadge status={product.status} />}
                      />
                      <DetailItem
                        label="Créé le"
                        value={new Date(product.createdAt).toLocaleDateString(
                          "fr-FR",
                        )}
                      />
                    </DetailGrid>
                    {product.description && (
                      <DetailGrid columns={1}>
                        <DetailItem
                          label="Description"
                          value={product.description}
                        />
                      </DetailGrid>
                    )}
                  </DetailSection>,
                ),
                createDetailsTab(
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Variantes</p>
                    <VariantTable productId={product.id} />
                  </div>,
                ),
              ]}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/showcase/products/detail-sheet.tsx
git commit -m "feat(showcase): add product detail sheet"
```

---

## Task 8 — List page (`index.tsx`)

**Files:**

- Create: `apps/frontend/src/features/showcase/products/index.tsx`

- [ ] **Créer `index.tsx`**

```tsx
// apps/frontend/src/features/showcase/products/index.tsx
"use client";

import { BasePage } from "@/components/layout/base-page";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/pagination";
import { PageHeader, PageHeaderActions } from "@/components/page-header";
import TableHeader from "@/components/table-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { AlertCircleIcon } from "@/lib/icons";
import { ProductDetailSheet } from "./detail-sheet";
import { useProducts } from "./hooks";

export function ProductsListPage() {
  const {
    items,
    total,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    setSelectedItems,
    selectedId,
    setSelectedId,
    handlers,
    columns,
    searchConfig,
    filtersConfig,
    actionsConfig,
    bulkActionsConfig,
    ConfirmDialogComponent,
  } = useProducts();

  return (
    <BasePage
      breadcrumbs={[
        { title: "Showcase" },
        { title: "Produits", url: "/showcase/products" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Produits"
          description="Gérez votre catalogue de produits."
          variant="list"
          primaryAction={PageHeaderActions.create(
            "/showcase/products/new",
            "Nouveau produit",
          )}
        />

        <TableHeader
          search={searchConfig}
          filters={filtersConfig}
          actions={actionsConfig}
          bulkActions={bulkActionsConfig}
        />

        {error && (
          <Alert variant="destructive">
            <Icon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertDescription>
              Erreur : {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          pagination={false}
          selectable
          onSelectionChange={setSelectedItems}
          emptyMessage="Aucun produit trouvé."
        />

        {total > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / pageSize)}
            pageSize={pageSize}
            totalCount={total}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        )}
      </div>

      {ConfirmDialogComponent}

      <ProductDetailSheet
        productId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        handlers={handlers}
      />
    </BasePage>
  );
}
```

- [ ] **Créer la route app `app/(dashboard)/showcase/products/page.tsx`**

```tsx
// apps/frontend/src/app/(dashboard)/showcase/products/page.tsx
import { ProductsListPage } from "@/features/showcase/products/index";

export default function Page() {
  return <ProductsListPage />;
}
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/showcase/products/index.tsx
git add "apps/frontend/src/app/(dashboard)/showcase/products/page.tsx"
git commit -m "feat(showcase): add products list page"
```

---

## Task 9 — Detail page (`detail-page.tsx`)

**Files:**

- Create: `apps/frontend/src/features/showcase/products/detail-page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/showcase/products/[productId]/page.tsx`

- [ ] **Créer `detail-page.tsx`**

```tsx
// apps/frontend/src/features/showcase/products/detail-page.tsx
"use client";

import { notFound, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BasePage } from "@/components/layout/base-page";
import { PageHeader, PageHeaderActions } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  DetailSection,
  DetailGrid,
  DetailItem,
  DetailSummary,
} from "@/components/detail-section";
import {
  DetailTabs,
  createOverviewTab,
  createDetailsTab,
  createActivityTab,
} from "@/components/detail-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { AlertCircleIcon } from "@/lib/icons";
import {
  useConfirmDialog,
  confirmDialogPresets,
} from "@/components/hooks/use-confirm-dialog";
import { VariantTable } from "./_components/variant-table";
import * as mockStore from "./mock-store";
import { productKeys } from "./hooks";

interface ProductDetailPageProps {
  productId: string;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return mockStore.getProductById(productId) ?? null;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => mockStore.deleteProduct(productId),
    onSuccess: () => {
      toast.success("Produit supprimé");
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      router.push("/showcase/products");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleDelete = async () => {
    const ok = await confirm(confirmDialogPresets.delete(`"${product?.name}"`));
    if (!ok) return;
    await deleteMutation.mutateAsync();
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <BasePage
        breadcrumbs={[
          { title: "Showcase" },
          { title: "Produits", url: "/showcase/products" },
          { title: "Chargement..." },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </BasePage>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BasePage
        breadcrumbs={[
          { title: "Showcase" },
          { title: "Produits", url: "/showcase/products" },
          { title: "Erreur" },
        ]}
      >
        <Alert variant="destructive">
          <Icon icon={AlertCircleIcon} className="h-4 w-4" />
          <AlertDescription>Impossible de charger ce produit.</AlertDescription>
        </Alert>
      </BasePage>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!product) return notFound();

  const variants = mockStore.getVariantsByProductId(productId);
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const stockValue = product.price * product.stock;
  const similarProduct = product.similarProductId
    ? mockStore.getProductById(product.similarProductId)
    : undefined;

  // ── Content ────────────────────────────────────────────────────────────────
  return (
    <BasePage
      breadcrumbs={[
        { title: "Showcase" },
        { title: "Produits", url: "/showcase/products" },
        { title: product.name },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title={product.name}
          description={product.reference}
          variant="detail-card"
          backNavigation={{ href: "/showcase/products", label: "Produits" }}
          status={<StatusBadge status={product.status} />}
          primaryAction={PageHeaderActions.edit(
            `/showcase/products/${productId}/edit`,
          )}
          secondaryActions={[PageHeaderActions.delete(handleDelete)]}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Prix unitaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {product.price.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Stock disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${product.stock === 0 ? "text-destructive" : ""}`}
              >
                {product.stock} unité(s)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Variantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{variants.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <DetailTabs
          tabs={[
            createOverviewTab(
              <DetailSection title="Informations générales">
                <DetailGrid columns={2}>
                  <DetailItem label="Référence" value={product.reference} />
                  <DetailItem label="Catégorie" value={product.category} />
                  <DetailItem
                    label="Prix"
                    value={product.price.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  />
                  <DetailItem
                    label="Stock"
                    value={
                      <span
                        className={
                          product.stock === 0
                            ? "text-destructive font-medium"
                            : undefined
                        }
                      >
                        {product.stock} unité(s)
                      </span>
                    }
                  />
                  <DetailItem
                    label="Statut"
                    value={<StatusBadge status={product.status} />}
                  />
                  <DetailItem
                    label="Créé le"
                    value={new Date(product.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  />
                  {similarProduct && (
                    <DetailItem
                      label="Produit similaire"
                      value={`${similarProduct.name} (${similarProduct.reference})`}
                    />
                  )}
                </DetailGrid>
                {product.description && (
                  <DetailGrid columns={1}>
                    <DetailItem
                      label="Description"
                      value={product.description}
                    />
                  </DetailGrid>
                )}
              </DetailSection>,
            ),
            createDetailsTab(
              <div className="space-y-4">
                <p className="text-sm font-medium">
                  {variants.length} variante(s)
                </p>
                <VariantTable productId={productId} />
              </div>,
            ),
            createActivityTab(
              <DetailSummary
                title="Résumé financier"
                items={[
                  {
                    label: "Valeur du stock",
                    value: stockValue.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }),
                    variant: "success",
                  },
                  {
                    label: "Stock total (variantes)",
                    value: `${totalStock} unité(s)`,
                  },
                  {
                    label: "Variantes actives",
                    value: variants.filter((v) => v.status === "ACTIVE").length,
                  },
                  {
                    label: "Variantes épuisées",
                    value: variants.filter((v) => v.stock === 0).length,
                    variant:
                      variants.filter((v) => v.stock === 0).length > 0
                        ? "destructive"
                        : "default",
                  },
                ]}
              />,
            ),
          ]}
        />
      </div>

      {ConfirmDialogComponent}
    </BasePage>
  );
}
```

- [ ] **Créer la route `app/(dashboard)/showcase/products/[productId]/page.tsx`**

```tsx
// apps/frontend/src/app/(dashboard)/showcase/products/[productId]/page.tsx
import { ProductDetailPage } from "@/features/showcase/products/detail-page";

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function Page({ params }: Props) {
  const { productId } = await params;
  return <ProductDetailPage productId={productId} />;
}
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/showcase/products/detail-page.tsx
git add "apps/frontend/src/app/(dashboard)/showcase/products/[productId]/page.tsx"
git commit -m "feat(showcase): add product detail page"
```

---

## Task 10 — Form pages (`schema.ts` + `new-page.tsx` + `edit-page.tsx`)

**Files:**

- Create: `apps/frontend/src/features/showcase/products/schema.ts`
- Create: `apps/frontend/src/features/showcase/products/new-page.tsx`
- Create: `apps/frontend/src/features/showcase/products/edit-page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/showcase/products/new/page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/showcase/products/[productId]/edit/page.tsx`

- [ ] **Créer `schema.ts`**

```ts
// apps/frontend/src/features/showcase/products/schema.ts
import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  reference: z
    .string()
    .min(2, "La référence doit contenir au moins 2 caractères"),
  category: z.enum(["Électronique", "Vêtements", "Alimentation", "Mobilier"], {
    required_error: "Sélectionnez une catégorie",
  }),
  price: z.coerce.number().positive("Le prix doit être positif"),
  stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif"),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT", "OUT_OF_STOCK"], {
    required_error: "Sélectionnez un statut",
  }),
  description: z.string().optional().default(""),
  similarProductId: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
```

- [ ] **Créer `new-page.tsx`**

```tsx
// apps/frontend/src/features/showcase/products/new-page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BasePage } from "@/components/layout/base-page";
import { PageHeader, PageHeaderActions } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/form-section";
import SingleSelect from "@/components/single-select";
import { CategorySelect } from "./_components/category-select";
import { ProductSelect } from "./_components/product-select";
import * as mockStore from "./mock-store";
import { productFormSchema, type ProductFormValues } from "./schema";
import { productKeys } from "./hooks";

export function ProductNewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      reference: "",
      category: undefined,
      price: 0,
      stock: 0,
      status: "DRAFT",
      description: "",
      similarProductId: undefined,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await mockStore.createProduct(values);
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produit créé avec succès");
      router.push("/showcase/products");
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BasePage
      breadcrumbs={[
        { title: "Showcase" },
        { title: "Produits", url: "/showcase/products" },
        { title: "Nouveau produit" },
      ]}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <PageHeader
            title="Nouveau produit"
            variant="create"
            backNavigation={{ href: "/showcase/products", label: "Produits" }}
            primaryAction={PageHeaderActions.save(
              handleSubmit(onSubmit),
              isSubmitting,
            )}
            secondaryActions={[PageHeaderActions.cancel("/showcase/products")]}
          />

          <FormSection title="Informations générales">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  placeholder="ex : Laptop Pro 15"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference">Référence *</Label>
                <Input
                  id="reference"
                  placeholder="ex : ELEC-001"
                  {...register("reference")}
                />
                {errors.reference && (
                  <p className="text-xs text-destructive">
                    {errors.reference.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Catégorie *</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <CategorySelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    />
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Statut *</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <SingleSelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      options={[
                        { value: "ACTIVE", label: "Actif" },
                        { value: "INACTIVE", label: "Inactif" },
                        { value: "DRAFT", label: "Brouillon" },
                        { value: "OUT_OF_STOCK", label: "Rupture de stock" },
                      ]}
                      placeholder="Sélectionner un statut"
                      btnClassName="w-full"
                    />
                  )}
                />
                {errors.status && (
                  <p className="text-xs text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Tarification & Stock">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock initial *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("stock")}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Description & Liens">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le produit..."
                  rows={3}
                  {...register("description")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Produit similaire</Label>
                <Controller
                  control={control}
                  name="similarProductId"
                  render={({ field }) => (
                    <ProductSelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Optionnel — associez un produit similaire pour la
                  recommandation.
                </p>
              </div>
            </div>
          </FormSection>
        </div>
      </form>
    </BasePage>
  );
}
```

- [ ] **Créer `edit-page.tsx`**

```tsx
// apps/frontend/src/features/showcase/products/edit-page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BasePage } from "@/components/layout/base-page";
import { PageHeader, PageHeaderActions } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/form-section";
import SingleSelect from "@/components/single-select";
import { CategorySelect } from "./_components/category-select";
import { ProductSelect } from "./_components/product-select";
import * as mockStore from "./mock-store";
import { productFormSchema, type ProductFormValues } from "./schema";
import { productKeys } from "./hooks";

interface ProductEditPageProps {
  productId: string;
}

export function ProductEditPage({ productId }: ProductEditPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return mockStore.getProductById(productId) ?? null;
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      reference: "",
      category: undefined,
      price: 0,
      stock: 0,
      status: "DRAFT",
      description: "",
      similarProductId: undefined,
    },
  });

  // Pré-remplir le formulaire quand le produit est chargé
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        reference: product.reference,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: product.status,
        description: product.description ?? "",
        similarProductId: product.similarProductId ?? undefined,
      });
    }
  }, [product, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await mockStore.updateProduct(productId, values);
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produit mis à jour");
      router.push(`/showcase/products/${productId}`);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <BasePage
        breadcrumbs={[
          { title: "Showcase" },
          { title: "Produits", url: "/showcase/products" },
          { title: "Chargement..." },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </BasePage>
    );
  }

  return (
    <BasePage
      breadcrumbs={[
        { title: "Showcase" },
        { title: "Produits", url: "/showcase/products" },
        { title: product?.name ?? "Modifier" },
        { title: "Modifier" },
      ]}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <PageHeader
            title={`Modifier — ${product?.name ?? ""}`}
            variant="edit"
            backNavigation={{
              href: `/showcase/products/${productId}`,
              label: "Fiche produit",
            }}
            primaryAction={PageHeaderActions.save(
              handleSubmit(onSubmit),
              isSubmitting,
            )}
            secondaryActions={[
              PageHeaderActions.cancel(`/showcase/products/${productId}`),
            ]}
          />

          <FormSection title="Informations générales">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference">Référence *</Label>
                <Input id="reference" {...register("reference")} />
                {errors.reference && (
                  <p className="text-xs text-destructive">
                    {errors.reference.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Catégorie *</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <CategorySelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    />
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Statut *</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <SingleSelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      options={[
                        { value: "ACTIVE", label: "Actif" },
                        { value: "INACTIVE", label: "Inactif" },
                        { value: "DRAFT", label: "Brouillon" },
                        { value: "OUT_OF_STOCK", label: "Rupture de stock" },
                      ]}
                      placeholder="Statut"
                      btnClassName="w-full"
                    />
                  )}
                />
                {errors.status && (
                  <p className="text-xs text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Tarification & Stock">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  {...register("stock")}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Description & Liens">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  {...register("description")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Produit similaire</Label>
                <Controller
                  control={control}
                  name="similarProductId"
                  render={({ field }) => (
                    <ProductSelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      excludeId={productId}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Optionnel — associez un produit similaire pour la
                  recommandation.
                </p>
              </div>
            </div>
          </FormSection>
        </div>
      </form>
    </BasePage>
  );
}
```

- [ ] **Créer les routes app**

```tsx
// apps/frontend/src/app/(dashboard)/showcase/products/new/page.tsx
import { ProductNewPage } from "@/features/showcase/products/new-page";

export default function Page() {
  return <ProductNewPage />;
}
```

```tsx
// apps/frontend/src/app/(dashboard)/showcase/products/[productId]/edit/page.tsx
import { ProductEditPage } from "@/features/showcase/products/edit-page";

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function Page({ params }: Props) {
  const { productId } = await params;
  return <ProductEditPage productId={productId} />;
}
```

- [ ] **Commit**

```bash
git add apps/frontend/src/features/showcase/products/schema.ts
git add apps/frontend/src/features/showcase/products/new-page.tsx
git add apps/frontend/src/features/showcase/products/edit-page.tsx
git add apps/frontend/src/app/\(dashboard\)/showcase/products/new/page.tsx
git add "apps/frontend/src/app/(dashboard)/showcase/products/[productId]/edit/page.tsx"
git commit -m "feat(showcase): add product create and edit form pages"
```

---

## Task 11 — Vérification TypeScript + commit final

**Files:** (aucun nouveau fichier)

- [ ] **Vérifier zéro erreur TypeScript**

```bash
cd apps/frontend && bun run tsc --noEmit
```

Sortie attendue : aucune erreur. Si des erreurs apparaissent :

- Erreur `Property 'X' does not exist` → vérifier les imports et les noms de composants
- Erreur sur `params` → s'assurer que les routes utilisent `Promise<{ productId: string }>` et `await params`
- Erreur sur `createAction` → vérifier que l'import vient de `@/components/cell-actions`

- [ ] **Commit final**

```bash
git add -A
git commit -m "feat(showcase): complete products showcase module — all shared components demonstrated"
```
