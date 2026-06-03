"use client";

import PageHeader from "@/components/shared/page-header";
import { NumberingForm } from "./_components/numbering-form";

export default function NumberingSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Numérotation des documents"
        description="Configurez les préférences de numérotation des documents"
        variant="list"
      />

      <NumberingForm />
    </div>
  );
}
