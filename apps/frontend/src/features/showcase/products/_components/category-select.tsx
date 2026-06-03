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
