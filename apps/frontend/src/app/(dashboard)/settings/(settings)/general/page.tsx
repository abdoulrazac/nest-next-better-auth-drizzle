"use client";

import PageHeader from "@/components/shared/page-header";
import { GeneralSettingsForm } from "./_components/general-settings-form";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres généraux"
        description="Configurez les préférences générales de l'application"
        variant="list"
      />

      <GeneralSettingsForm />
    </div>
  );
}
