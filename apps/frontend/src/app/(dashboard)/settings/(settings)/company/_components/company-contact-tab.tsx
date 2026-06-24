// @ts-nocheck
"use client";

import { CountrySelect } from "@/components/country-select";
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
import { Call02Icon } from "@hugeicons/core-free-icons";
import { type Control, Controller } from "react-hook-form";

interface Props {
  control: Control<UpdateCompanyInput>;
}

export function CompanyContactTab({ control }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon={Call02Icon} className="size-5" />
          Coordonnées
        </CardTitle>
        <CardDescription>
          Informations de contact et adresse de votre entreprise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="contact@entreprise.com"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone">Téléphone *</FieldLabel>
                  <Input {...field} id="phone" placeholder="+226 20 000 000" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="phone2"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone2">Téléphone 2</FieldLabel>
                  <Input {...field} id="phone2" placeholder="+226 20 000 001" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="website"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="website">Site web</FieldLabel>
                  <Input
                    {...field}
                    id="website"
                    placeholder="https://www.entreprise.com"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="md:col-span-2"
                >
                  <FieldLabel htmlFor="address">Adresse</FieldLabel>
                  <Input
                    {...field}
                    id="address"
                    placeholder="Rue, quartier, commune"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="city"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="city">Ville</FieldLabel>
                  <Input {...field} id="city" placeholder="Ouagadougou" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="postalCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="postalCode">Code postal</FieldLabel>
                  <Input {...field} id="postalCode" placeholder="01 BP 0000" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="country"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="country">Pays</FieldLabel>
                  <CountrySelect
                    onChange={field.onChange}
                    defaultValue={field.value ?? "Burkina Faso"}
                    placeholder="Sélectionner le pays"
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
