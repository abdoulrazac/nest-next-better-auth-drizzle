// @ts-nocheck
"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ErrorState, LoadingState } from "@/components/shared";
import { api } from "@/trpc/react";

export function SettingsDashboardKpis() {
  const { data, isLoading, isError, error, refetch } =
    api.settings.dashboard.getKpis.useQuery({});
  const kpis = (data?.kpis ?? {}) as Record<string, number | string | null>;

  if (isLoading) {
    return <LoadingState message="Chargement des KPIs paramétrage..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? "Impossible de charger les indicateurs."}
        onRetry={() => refetch()}
        compact
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Séquences actives"
        value={Number(kpis.activeSequences ?? 0)}
      />
      <KpiCard
        title="Webhooks actifs"
        value={Number(kpis.activeWebhooks ?? 0)}
      />
      <KpiCard
        title="Backups réussis"
        value={Number(kpis.completedBackups ?? 0)}
        variant="success"
      />
      <KpiCard
        title="Backups échoués"
        value={Number(kpis.failedBackups ?? 0)}
        variant="destructive"
      />
      <KpiCard title="Archives" value={Number(kpis.archivedItems ?? 0)} />
      <KpiCard
        title="Templates email"
        value={Number(kpis.emailTemplates ?? 0)}
      />
      <KpiCard
        title="Webhooks inactifs"
        value={Number(kpis.inactiveWebhooks ?? 0)}
        variant="warning"
      />
      <KpiCard
        title="Dernier backup"
        value={
          kpis.lastBackupAt
            ? new Date(String(kpis.lastBackupAt)).toLocaleDateString("fr-FR")
            : "-"
        }
      />
    </div>
  );
}
