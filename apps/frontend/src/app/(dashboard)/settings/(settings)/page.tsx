"use client";

import PageHeader from "@/components/page-header";
import { SettingsDashboardChart } from "./_components/dashboard-chart";
import { SettingsDashboardKpis } from "./_components/dashboard-kpis";
import { SettingsDashboardRecentActions } from "./_components/dashboard-recent-actions";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vue d'ensemble"
        description="Obtenez un aperçu rapide de la santé de votre plateforme et accédez aux paramètres clés"
        variant="list"
      />

      <SettingsDashboardKpis />
      <SettingsDashboardChart />
      <SettingsDashboardRecentActions />
    </div>
  );
}
