// @ts-nocheck
"use client";

import { useUploadFiles } from "@better-upload/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BankIcon,
  Building01Icon,
  Call02Icon,
  Image01Icon,
  Save,
  TaxesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  updateCompanySchema,
  type UpdateCompanyInput,
} from "@/server/api/settings/schemas/company.schema";
import { api } from "@/trpc/react";
import { CompanyBankTab } from "./company-bank-tab";
import { CompanyContactTab } from "./company-contact-tab";
import { CompanyDgiTab } from "./company-dgi-tab";
import { CompanyGeneralTab } from "./company-general-tab";
import { CompanyHeaderCard } from "./company-header-card";
import { CompanyLogoTab } from "./company-logo-tab";

const LEGAL_FORMS: Array<NonNullable<UpdateCompanyInput["legalForm"]>> = [
  "SARL",
  "SA",
  "SAS",
  "EURL",
  "EI",
  "GIE",
  "AUTRE",
];
const FISCAL_REGIMES: Array<NonNullable<UpdateCompanyInput["fiscalRegime"]>> = [
  "REAL_NORMAL",
  "REAL_SIMPLIFIE",
  "FORFAITAIRE",
];

export function CompanyForm() {
  const utils = api.useUtils();
  const {
    data: companyData,
    isLoading,
    isError,
    error,
    refetch,
  } = api.settings.company.get.useQuery();

  const updateMutation = api.settings.company.update.useMutation({
    onSuccess: () => {
      void utils.settings.company.invalidate();
      toast.success("Informations mises à jour avec succès");
    },
    onError: (e) => toast.error(e.message || "Erreur lors de la mise à jour"),
  });

  const form = useForm<UpdateCompanyInput>({
    resolver: zodResolver(updateCompanySchema) as any,
    defaultValues: {
      name: "",
      legalForm: "SARL",
      rccm: "",
      ifu: "",
      fiscalRegime: undefined,
      capitalSocial: undefined,
      creationDate: undefined,
      address: "",
      city: "",
      country: "Burkina Faso",
      postalCode: "",
      phone: "",
      phone2: "",
      email: "",
      website: "",
      logo: "",
      bankName: "",
      bankAccountNumber: "",
      iban: "",
      swiftCode: "",
      taxOffice: "",
      cadastralRef: "",
      psvbGroup: "A",
    },
  });

  useEffect(() => {
    if (!companyData) return;
    const legalForm = LEGAL_FORMS.includes(companyData.legalForm as any)
      ? (companyData.legalForm as any)
      : "SARL";
    const fiscalRegime = FISCAL_REGIMES.includes(
      companyData.fiscalRegime as any,
    )
      ? (companyData.fiscalRegime as any)
      : undefined;
    form.reset({
      name: companyData.name ?? "",
      legalForm,
      rccm: companyData.rccm ?? "",
      ifu: companyData.ifu ?? "",
      taxOffice: companyData.taxOffice ?? "",
      fiscalRegime,
      capitalSocial: companyData.capitalSocial ?? undefined,
      creationDate: companyData.creationDate
        ? new Date(companyData.creationDate)
        : undefined,
      address: companyData.address ?? "",
      city: companyData.city ?? "",
      country: companyData.country ?? "Burkina Faso",
      postalCode: companyData.postalCode ?? "",
      phone: companyData.phone ?? "",
      phone2: companyData.phone2 ?? "",
      email: companyData.email ?? "",
      website: companyData.website ?? "",
      logo: companyData.logo ?? "",
      bankName: companyData.bankName ?? "",
      bankAccountNumber: companyData.bankAccountNumber ?? "",
      iban: companyData.iban ?? "",
      swiftCode: companyData.swiftCode ?? "",
      cadastralRef: companyData.cadastralRef ?? "",
      psvbGroup: (companyData.psvbGroup as any) ?? "A",
    });
  }, [companyData, form]);

  const uploader = useUploadFiles({
    route: "images",
    onUploadComplete: ({ files }) => {
      if (files[0]) form.setValue("logo", files[0].objectInfo.key);
    },
    onError: (e) =>
      form.setError("logo", { message: e.message || "Erreur d'upload" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error?.message ??
          "Impossible de charger les informations de l'entreprise."
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CompanyHeaderCard company={companyData} />

      <form onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))}>
        <Tabs defaultValue="legal" className="w-full">
          <TabsList className="flex w-full max-w-xl mb-4" variant="line">
            <TabsTrigger value="legal" className="gap-1.5">
              <HugeiconsIcon icon={Building01Icon} className="size-4" />
              <span className="hidden sm:inline">Identité légale</span>
              <span className="sm:hidden">Légal</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5">
              <HugeiconsIcon icon={Call02Icon} className="size-4" />
              <span className="hidden sm:inline">Coordonnées</span>
              <span className="sm:hidden">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="gap-1.5">
              <HugeiconsIcon icon={BankIcon} className="size-4" />
              Banque
            </TabsTrigger>
            <TabsTrigger value="dgi" className="gap-1.5">
              <HugeiconsIcon icon={TaxesIcon} className="size-4" />
              DGI
            </TabsTrigger>
            <TabsTrigger value="logo" className="gap-1.5">
              <HugeiconsIcon icon={Image01Icon} className="size-4" />
              Logo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="legal">
            <CompanyGeneralTab control={form.control} />
          </TabsContent>
          <TabsContent value="contact">
            <CompanyContactTab control={form.control} />
          </TabsContent>
          <TabsContent value="bank">
            <CompanyBankTab control={form.control} />
          </TabsContent>
          <TabsContent value="dgi">
            <CompanyDgiTab control={form.control} />
          </TabsContent>
          <TabsContent value="logo">
            <CompanyLogoTab
              control={form.control}
              watch={form.watch}
              uploaderControl={uploader.control}
              logoUrl={companyData?.logoUrl}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button disabled={updateMutation.isPending} type="submit">
            <HugeiconsIcon icon={Save} className="size-4" />
            {updateMutation.isPending
              ? "Enregistrement…"
              : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}
