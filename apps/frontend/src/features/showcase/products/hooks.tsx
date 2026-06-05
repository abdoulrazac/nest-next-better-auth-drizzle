// apps/frontend/src/features/showcase/products/hooks.ts
"use client";

import {
  executeBulkAction,
  showBulkResultToast,
} from "@/components/hooks/use-bulk-selection";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/components/hooks/use-confirm-dialog";
import SingleSelect from "@/components/single-select";
import {
  createBulkActions,
  createFilterField,
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import { TrashIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTableParams } from "@/hooks/use-table-params";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { buildProductColumns } from "./columns";
import * as mockStore from "./mock-store";
import type { Product } from "./types";

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
  } = useTableParams({ filterKeys: ["status", "category"] });
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Data — TanStack Query avec queryFn mockée
  const { data, isLoading, error } = useQuery({
    queryKey: productKeys.list({
      page,
      pageSize,
      search,
      status: getFilter("status"),
      category: getFilter("category"),
    }),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const all = mockStore.getProducts();
      const q = search.toLowerCase();
      const statusVal = getFilter("status");
      const categoryVal = getFilter("category");
      const filtered = all.filter((p) => {
        const matchSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q);
        const matchStatus = !statusVal || p.status === statusVal;
        const matchCategory = !categoryVal || p.category === categoryVal;
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
      onEdit: (id: string) => router.push(`/showcase/products/${id}/edit`),
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
        showBulkResultToast(
          result,
          "Produits supprimés",
          "Erreur de suppression",
        );
        setSelectedItems([]);
        void queryClient.invalidateQueries({ queryKey: productKeys.all });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItems],
  );

  // Table config
  const columns = useMemo(() => buildProductColumns(handlers), [handlers]);

  const searchConfig = createSearchField(search, setSearch, {
    placeholder: "Rechercher un produit...",
  });

  const filtersConfig = [
    createFilterField(
      "status",
      <SingleSelect
        value={getFilter("status")}
        onValueChange={(v) =>
          setFilter("status", getFilter("status") === v ? "" : v)
        }
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
        value={getFilter("category")}
        onValueChange={(v) =>
          setFilter("category", getFilter("category") === v ? "" : v)
        }
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

  const actionsConfig = [createResetButton(resetFilters)];

  const bulkActionsConfig =
    selectedItems.length > 0
      ? createBulkActions(
          selectedItems.length,
          [
            {
              label: "Supprimer",
              icon: <HugeiconsIcon icon={TrashIcon} className="h-4 w-4" />,
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
