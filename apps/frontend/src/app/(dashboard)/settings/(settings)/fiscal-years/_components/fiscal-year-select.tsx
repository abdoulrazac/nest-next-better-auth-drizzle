// @ts-nocheck
"use client";

import SingleSelect from "@/components/single-select";
import { api } from "@/trpc/react";
import { useState } from "react";
import { useDebounce } from "use-debounce";

interface FiscalYearSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Pre-fill with a known fiscal year id (e.g. from URL param or existing record) */
  defaultFiscalYearId?: string;
  /** Skip fetching defaultFiscalYearId when editing an existing document */
  isEditing?: boolean;
  disabled?: boolean;
  placeholder?: string;
  btnClassName?: string;
}

export function FiscalYearSelect({
  value,
  onValueChange,
  defaultFiscalYearId,
  isEditing,
  disabled,
  placeholder = "Sélectionner un exercice",
  btnClassName = "w-full max-w-lg",
}: FiscalYearSelectProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);

  // --- Search ---
  const { data: searchData } = api.settings.fiscalYear.getAll.useQuery({
    skip: 0,
    take: 20,
    search: debouncedQuery || undefined,
  });
  const searchResults: any[] = (searchData as any)?.data ?? [];

  // --- Default fiscal year (pre-fill on create forms) ---
  const { data: defaultFy } = api.settings.fiscalYear.getById.useQuery(
    { id: defaultFiscalYearId ?? "" },
    { enabled: Boolean(defaultFiscalYearId) && !isEditing },
  );

  // --- Selected fiscal year (ensure it always appears in list) ---
  const { data: selectedFy } = api.settings.fiscalYear.getById.useQuery(
    { id: value },
    { enabled: Boolean(value) && value !== defaultFiscalYearId },
  );

  // Deduplicate: extras (default + selected) + search results
  const extras = [defaultFy, selectedFy].filter(
    (e): e is NonNullable<typeof e> =>
      Boolean(e) && !searchResults.find((s: any) => s.id === (e as any).id),
  );
  const fiscalYears = [...extras, ...searchResults];

  return (
    <SingleSelect
      value={value}
      onValueChange={onValueChange}
      onSearchChange={setQuery}
      options={fiscalYears.map((fy: any) => ({
        value: fy.id,
        label: fy.status === "CLOSED" ? `${fy.label} (Clôturé)` : fy.label,
      }))}
      placeholder={placeholder}
      searchPlaceholder="Rechercher un exercice..."
      disabled={disabled}
      btnClassName={btnClassName}
    />
  );
}
