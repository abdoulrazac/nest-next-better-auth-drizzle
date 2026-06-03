// @ts-nocheck
"use client";

import SingleSelect from "@/components/single-select";
import { api } from "@/trpc/react";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { CreateTaxRateDialog } from "./create-tax-rate-dialog";

export interface TaxRateSelectItem {
  id: string;
  label: string;
  rate: number;
  taxGroup?: string | null;
}

interface TaxRateSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Called with the full tax-rate object on selection */
  onTaxRateSelect?: (taxRate: TaxRateSelectItem) => void;
  defaultTaxRateId?: string;
  isEditing?: boolean;
  disabled?: boolean;
}

export function TaxRateSelect({
  value,
  onValueChange,
  onTaxRateSelect,
  defaultTaxRateId,
  isEditing,
  disabled,
}: TaxRateSelectProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [dialogOpen, setDialogOpen] = useState(false);

  const utils = api.useUtils();

  // --- Search ---
  const { data: taxRateResults } = api.common.taxRate.getAll.useQuery({
    search: debouncedQuery,
    take: 20,
    status: "ACTIVE",
  });

  // --- Default tax rate (pre-fill on create forms) ---
  const { data: defaultTaxRate } = api.common.taxRate.getById.useQuery(
    { id: defaultTaxRateId ?? "" },
    { enabled: Boolean(defaultTaxRateId) && !isEditing },
  );

  // --- Selected tax rate (ensure it always appears in list) ---
  const { data: selectedTaxRate } = api.common.taxRate.getById.useQuery(
    { id: value },
    { enabled: Boolean(value) && value !== defaultTaxRateId },
  );

  const searchTaxRates = taxRateResults?.data ?? [];

  // Deduplicate: extras (default + selected) + search results
  const extras = [defaultTaxRate, selectedTaxRate].filter(
    (t): t is NonNullable<typeof t> =>
      Boolean(t) && !searchTaxRates.find((r) => r.id === t!.id),
  );
  const taxRates = [...extras, ...searchTaxRates];

  const handleSelect = (id: string) => {
    onValueChange(id);
    if (onTaxRateSelect) {
      const taxRate = taxRates.find((t) => t.id === id);
      if (taxRate) {
        onTaxRateSelect(taxRate as TaxRateSelectItem);
      }
    }
  };

  return (
    <>
      <SingleSelect
        value={value}
        onValueChange={handleSelect}
        onSearchChange={setQuery}
        options={taxRates.map((t) => ({
          value: t.id,
          label: t.label,
        }))}
        placeholder="Sélectionner TVA…"
        searchPlaceholder="Rechercher un taux…"
        addNewLabel="Nouveau taux de TVA"
        onClickAddNew={() => setDialogOpen(true)}
        disabled={disabled}
        btnClassName="w-full max-w-lg"
      />
      <CreateTaxRateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(taxRate) => {
          onValueChange(taxRate.id);
          if (onTaxRateSelect) {
            onTaxRateSelect(taxRate);
          }
          void utils.common.taxRate.getAll.invalidate();
        }}
      />
    </>
  );
}
