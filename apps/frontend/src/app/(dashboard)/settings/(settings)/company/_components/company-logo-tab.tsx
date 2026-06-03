// @ts-nocheck
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type Control, Controller, type UseFormWatch } from "react-hook-form";
import type { UpdateCompanyInput } from "@/server/api/settings/schemas/company.schema";
import type { UploadHookControl } from "@better-upload/client";

interface Props {
  control: Control<UpdateCompanyInput>;
  watch: UseFormWatch<UpdateCompanyInput>;
  uploaderControl: UploadHookControl<true>;
  logoUrl?: string | null;
}

export function CompanyLogoTab({
  control,
  watch,
  uploaderControl,
  logoUrl,
}: Props) {
  const currentLogo = watch("logo");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Image01Icon} className="size-5" />
          Logo de l'entreprise
        </CardTitle>
        <CardDescription>
          Uploadez le logo qui apparaîtra sur vos documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Aperçu actuel */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Aperçu actuel</p>
            <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo actuel"
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={Image01Icon} className="size-12" />
                  <span className="text-sm">Aucun logo</span>
                </div>
              )}
            </div>
          </div>

          {/* Zone d'upload */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Changer le logo</p>
            <Controller
              control={control}
              name="logo"
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <UploadDropzone
                    accept="image/*"
                    control={uploaderControl}
                    description={{
                      fileTypes: "PNG, JPG, SVG",
                      maxFiles: 1,
                      maxFileSize: "2MB",
                    }}
                    preview
                  />
                  {currentLogo && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Fichier : {currentLogo}
                    </p>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
