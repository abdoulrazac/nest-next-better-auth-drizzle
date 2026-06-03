// @ts-nocheck
"use client";

import CalendarPopover from "@/components/calendar-popover";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CreateFiscalYearInput } from "@/server/api/settings/schemas/fiscal-year.schema";
import type { UseFormReturn } from "react-hook-form";

export function fiscalYearDefaultValues(): CreateFiscalYearInput {
  const year = new Date().getFullYear();
  return {
    label: `Exercice ${year}`,
    startDate: new Date(`${year}-01-01`),
    endDate: new Date(`${year}-12-31`),
    isDefault: false,
    notes: "",
  };
}

export function fiscalYearToFormValues(
  fy: Record<string, any>,
): CreateFiscalYearInput {
  return {
    label: fy.label ?? "",
    startDate: new Date(fy.startDate),
    endDate: new Date(fy.endDate),
    isDefault: fy.isDefault ?? false,
    notes: fy.notes ?? "",
  };
}

interface FiscalYearFormFieldsProps {
  form: UseFormReturn<CreateFiscalYearInput>;
}

export function FiscalYearFormFields({ form }: FiscalYearFormFieldsProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="label">Libellé</FieldLabel>
          <Input
            id="label"
            placeholder="ex: Exercice 2025"
            {...register("label")}
          />
          {errors.label && (
            <p className="text-xs text-destructive">{errors.label.message}</p>
          )}
        </Field>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="startDate">Date de début</FieldLabel>
          <CalendarPopover
            mode="single"
            value={form.watch("startDate")}
            onChange={(v) => form.setValue("startDate", v as Date)}
            placeholder="Choisir une date"
          />
          {errors.startDate && (
            <p className="text-xs text-destructive">
              {errors.startDate.message}
            </p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="endDate">Date de fin</FieldLabel>
          <CalendarPopover
            mode="single"
            value={form.watch("endDate")}
            onChange={(v) => form.setValue("endDate", v as Date)}
            placeholder="Choisir une date"
          />
          {errors.endDate && (
            <p className="text-xs text-destructive">{errors.endDate.message}</p>
          )}
        </Field>
      </div>

      <FieldGroup>
        <Field className="flex flex-row items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <FieldLabel htmlFor="isDefault">Exercice actif</FieldLabel>
            <p className="text-xs text-muted-foreground">
              Définir cet exercice comme exercice fiscal actif de l'organisation
            </p>
          </div>
          <Switch
            id="isDefault"
            checked={watch("isDefault")}
            onCheckedChange={(val) => setValue("isDefault", val)}
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="notes">Notes (optionnel)</FieldLabel>
          <Textarea
            id="notes"
            placeholder="Remarques sur cet exercice..."
            rows={2}
            {...register("notes")}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
