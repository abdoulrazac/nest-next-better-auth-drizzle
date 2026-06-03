// @ts-nocheck
"use client";

import SingleSelect from "@/components/single-select";
import { api } from "@/trpc/react";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { CreateSpecificTaxDialog } from "./create-specific-tax-dialog";

interface SpecificTaxSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function SpecificTaxSelect({
  value,
  onValueChange,
  disabled,
}: SpecificTaxSelectProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [dialogOpen, setDialogOpen] = useState(false);

  const utils = api.useUtils();

  const { data: results } = api.common.specificTax.search.useQuery({
    search: debouncedQuery || undefined,
    take: 20,
  });

  const taxes = results ?? [];

  return (
    <>
      <SingleSelect
        value={value}
        onValueChange={onValueChange}
        onSearchChange={setQuery}
        options={taxes.map((t: any) => ({
          value: t.id,
          label: `${t.name} (${Number(t.rate)}%)`,
        }))}
        placeholder="Sélectionner une taxe spécifique…"
        searchPlaceholder="Nom de la taxe…"
        addNewLabel="Nouvelle taxe spécifique"
        onClickAddNew={() => setDialogOpen(true)}
        disabled={disabled}
        btnClassName="w-full max-w-lg"
      />
      <CreateSpecificTaxDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(tax) => {
          onValueChange(tax.id);
          void utils.common.specificTax.search.invalidate();
        }}
      />
    </>
  );
}
