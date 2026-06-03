// @ts-nocheck
"use client";

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
import { Input } from "@/components/ui/input";
import { BankIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type Control, Controller } from "react-hook-form";
import type { UpdateCompanyInput } from "@/server/api/settings/schemas/company.schema";

interface Props {
  control: Control<UpdateCompanyInput>;
}

export function CompanyBankTab({ control }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={BankIcon} className="size-5" />
          Informations bancaires
        </CardTitle>
        <CardDescription>
          Coordonnées bancaires pour les paiements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              control={control}
              name="bankName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bankName">Banque</FieldLabel>
                  <Input
                    {...field}
                    id="bankName"
                    placeholder="Nom de la banque"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="bankAccountNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bankAccountNumber">
                    Numéro de compte
                  </FieldLabel>
                  <Input
                    {...field}
                    id="bankAccountNumber"
                    placeholder="Numéro de compte bancaire"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="iban"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="iban">IBAN</FieldLabel>
                  <Input
                    {...field}
                    id="iban"
                    placeholder="BJ00 XXXX XXXX XXXX"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="swiftCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="swiftCode">Code SWIFT / BIC</FieldLabel>
                  <Input {...field} id="swiftCode" placeholder="ABCDBJ2X" />
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
