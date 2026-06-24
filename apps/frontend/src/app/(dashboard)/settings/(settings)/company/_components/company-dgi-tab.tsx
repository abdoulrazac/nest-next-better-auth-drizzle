// @ts-nocheck
"use client";

import SingleSelect from "@/components/single-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import type { UpdateCompanyInput } from "@/server/api/settings/schemas/company.schema";
import { TaxesIcon } from "@hugeicons/core-free-icons";
import { type Control, Controller } from "react-hook-form";

const PSVB_OPTIONS = [
  { value: "A", label: "A — 2%" },
  { value: "B", label: "B — 1%" },
  { value: "C", label: "C — 0.2%" },
  { value: "D", label: "D — Exonéré" },
];

interface Props {
  control: Control<UpdateCompanyInput>;
}

export function CompanyDgiTab({ control }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon={TaxesIcon} className="size-5" />
          Paramètres fiscaux DGI
        </CardTitle>
        <CardDescription>
          Informations requises pour la certification e-MECEF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              control={control}
              name="taxOffice"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="taxOffice">
                    Division Fiscale (SERIMP)
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="taxOffice"
                    placeholder="ex: DPMC/DCI"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="cadastralRef"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="cadastralRef">
                    Références cadastrales
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="cadastralRef"
                    placeholder="ex: 0001 001 0001"
                    maxLength={20}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="psvbGroup"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="psvbGroup">Groupe PSVB</FieldLabel>
                  <SingleSelect
                    options={PSVB_OPTIONS}
                    value={field.value ?? "A"}
                    onValueChange={field.onChange}
                    placeholder="Sélectionner le groupe PSVB"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
