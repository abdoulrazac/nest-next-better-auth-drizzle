// @ts-nocheck
"use client";

import { ErrorState, LoadingState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import Link from "next/link";

const getStatusVariant = (status?: string) => {
  if (!status) return "outline";
  if (["ACTIVE", "COMPLETED"].includes(status)) return "secondary";
  if (["INACTIVE", "PENDING", "DRAFT"].includes(status)) return "outline";
  if (["ERROR", "FAILED", "REVOKED"].includes(status)) return "destructive";
  return "outline";
};

export function SettingsDashboardRecentActions() {
  const { data, isLoading, isError, error, refetch } =
    api.settings.dashboard.getRecentEntities.useQuery({});
  const recentBackups = (data?.recentBackups ?? []) as Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    size: number;
  }>;
  const recentWebhooks = (data?.recentWebhooks ?? []) as Array<{
    id: string;
    url: string;
    status: string;
  }>;
  const recentArchivedItems = (data?.recentArchivedItems ?? []) as Array<{
    id: string;
    entityType: string;
    reference?: string | null;
    name?: string | null;
  }>;

  if (isLoading) {
    return (
      <LoadingState message="Chargement des entités récentes paramétrage..." />
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error?.message ?? "Impossible de charger les données récentes."
        }
        onRetry={() => refetch()}
        compact
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>5 dernières sauvegardes</CardTitle>
          <Link
            className="text-blue-600 text-sm hover:underline"
            href="/settings/backup"
          >
            Voir tout
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentBackups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune sauvegarde
            </p>
          ) : (
            recentBackups.map((backup) => (
              <div
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                key={backup.id}
              >
                <div>
                  <p className="font-medium text-sm">{backup.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {backup.type} ·{" "}
                    {Math.round(Number(backup.size ?? 0) / 1024 / 1024)} MB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(backup.status)}>
                    {backup.status}
                  </Badge>
                  <Link
                    className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                    href="/settings/backup"
                  >
                    Gérer
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>5 webhooks récents</CardTitle>
          <Link
            className="text-blue-600 text-sm hover:underline"
            href="/settings/developers"
          >
            Voir tout
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentWebhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun webhook
            </p>
          ) : (
            recentWebhooks.map((webhook) => (
              <div
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                key={webhook.id}
              >
                <div>
                  <p className="font-medium text-sm truncate max-w-[160px]">
                    {webhook.url}
                  </p>
                  <p className="text-muted-foreground text-xs">Webhook</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(webhook.status)}>
                    {webhook.status}
                  </Badge>
                  <Link
                    className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                    href="/settings/developers"
                  >
                    Configurer
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>5 derniers archives</CardTitle>
          <Link
            className="text-blue-600 text-sm hover:underline"
            href="/archives"
          >
            Voir tout
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentArchivedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun élément archivé
            </p>
          ) : (
            recentArchivedItems.map((item) => (
              <div
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                key={item.id}
              >
                <div>
                  <p className="font-medium text-sm">
                    {item.reference ?? item.name ?? "-"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.entityType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">ARCHIVÉ</Badge>
                  <Link
                    className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                    href="/archives"
                  >
                    Restaurer
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
