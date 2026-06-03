"use client";

import PageHeader from "@/components/page-header";
import { CompanyForm } from "./_components/company-form";

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Données entreprise"
        description="Configurez les informations légales et coordonnées de votre entreprise"
        variant="list"
      />
      <CompanyForm />
    </div>
  );
}
