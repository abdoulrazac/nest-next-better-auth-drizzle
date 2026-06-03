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
