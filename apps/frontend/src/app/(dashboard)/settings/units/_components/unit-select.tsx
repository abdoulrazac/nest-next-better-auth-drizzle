// @ts-nocheck
"use client";

import SingleSelect from "@/components/single-select";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "use-debounce";

interface UnitSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function UnitSelect({
  value,
  onValueChange,
  disabled,
}: UnitSelectProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);

  const { data: unitResults } = api.common.unit.getAll.useQuery({
    search: debouncedQuery,
    take: 20,
    status: "ACTIVE",
  });

  const safeValue = value || "";

  const { data: selectedUnit } = api.common.unit.getById.useQuery(
    safeValue.length > 0 ? { id: safeValue } : skipToken,
  );

  const searchUnits = unitResults?.data ?? [];

  const extras = [selectedUnit].filter(
    (u): u is NonNullable<typeof u> =>
      Boolean(u) && !searchUnits.find((r) => r.id === u!.id),
  );
  const units = [...extras, ...searchUnits];

  return (
    <SingleSelect
      value={safeValue}
      onValueChange={onValueChange}
      onSearchChange={setQuery}
      options={units.map((u) => ({
        value: u.id,
        label: u.name,
      }))}
      placeholder="Sélectionner une unité…"
      searchPlaceholder="Rechercher une unité…"
      disabled={disabled}
      btnClassName="w-full max-w-lg"
    />
  );
}
