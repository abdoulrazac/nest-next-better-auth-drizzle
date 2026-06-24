// @ts-nocheck
"use client";

import CalendarPopover from "@/components/calendar-popover";
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
import { Building01Icon } from "@hugeicons/core-free-icons";
import { type Control, Controller } from "react-hook-form";

const legalFormOptions = [
  { value: "SARL", label: "SARL" },
  { value: "SA", label: "SA" },
  { value: "SAS", label: "SAS" },
  { value: "EURL", label: "EURL" },
  { value: "EI", label: "EI" },
  { value: "GIE", label: "GIE" },
  { value: "AUTRE", label: "Autre" },
];

const fiscalRegimeOptions = [
  { value: "REAL_NORMAL", label: "Réel normal" },
  { value: "REAL_SIMPLIFIE", label: "Réel simplifié" },
  { value: "FORFAITAIRE", label: "Forfaitaire" },
];

interface Props {
  control: Control<UpdateCompanyInput>;
}

export function CompanyGeneralTab({ control }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon={Building01Icon} className="size-5" />
          Identité légale
        </CardTitle>
        <CardDescription>
          Informations légales et fiscales de votre entreprise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Raison sociale *</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Nom de l'entreprise"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="legalForm"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="legalForm">Forme juridique *</FieldLabel>
                  <SingleSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Sélectionner"
                    options={legalFormOptions}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="rccm"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="rccm">RCCM *</FieldLabel>
                  <Input {...field} id="rccm" placeholder="RB/COT/00B/0000" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="ifu"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ifu">IFU *</FieldLabel>
                  <Input
                    {...field}
                    id="ifu"
                    placeholder="Identifiant Fiscal Unique"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="taxOffice"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="taxOffice">Division fiscale</FieldLabel>
                  <Input
                    {...field}
                    id="taxOffice"
                    placeholder="Direction de rattachement"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="fiscalRegime"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="fiscalRegime">Régime fiscal</FieldLabel>
                  <SingleSelect
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    placeholder="Sélectionner un régime"
                    options={fiscalRegimeOptions}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="capitalSocial"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="capitalSocial">
                    Capital social (XOF)
                  </FieldLabel>
                  <Input
                    {...field}
                    id="capitalSocial"
                    type="number"
                    min={0}
                    placeholder="1 000 000"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="creationDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="creationDate">
                    Date de création
                  </FieldLabel>
                  <CalendarPopover
                    mode="single"
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    placeholder="Date de création"
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
