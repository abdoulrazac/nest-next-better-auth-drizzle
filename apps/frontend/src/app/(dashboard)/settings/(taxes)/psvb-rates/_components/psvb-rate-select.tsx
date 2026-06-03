// @ts-nocheck
"use client";

import SingleSelect from "@/components/single-select";
import { api } from "@/trpc/react";
import { useState } from "react";

interface PsvbRateSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function PsvbRateSelect({
  value,
  onValueChange,
  disabled,
}: PsvbRateSelectProps) {
  const [query, setQuery] = useState("");

  const { data } = api.common.psvbRate.getAll.useQuery({
    search: query || undefined,
    take: 20,
    status: "ACTIVE",
  });

  const rates = data?.data ?? [];

  return (
    <SingleSelect
      value={value}
      onValueChange={onValueChange}
      onSearchChange={setQuery}
      options={rates.map((r: any) => ({
        value: r.id,
        label: `Groupe ${r.group} — ${r.label} (${Number(r.rate)}%)`,
      }))}
      placeholder="Sélectionner un taux PSVB…"
      searchPlaceholder="Groupe, libellé…"
      disabled={disabled}
      btnClassName="w-full max-w-lg"
    />
  );
}
