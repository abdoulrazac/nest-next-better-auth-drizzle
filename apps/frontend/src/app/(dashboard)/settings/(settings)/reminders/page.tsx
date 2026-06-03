"use client";

import PageHeader from "@/components/shared/page-header";
import { ReminderConfigForm } from "./_components/reminder-config-form";

export default function RemindersSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuration des relances"
        description="Configurez les délais et niveaux de rappels de paiement automatiques"
        variant="list"
      />

      <ReminderConfigForm />
    </div>
  );
}
