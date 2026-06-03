---
name: detail-page
description: "Scaffold a full detail/show page for an entity with loading/error/not-found guards, PageHeader variant=detail-card, DetailSection, DetailTabs, and optional KPI cards. Use when a resource detail is complex enough to need its own page."
---

# Detail Page Scaffold

## Template

```tsx
"use client";

import { BasePage } from "@/components/layout/base-page";
import PageHeader, { PageHeaderActions } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  DetailSection,
  DetailGrid,
  DetailItem,
  DetailSummary,
} from "@/components/detail-section";
import {
  DetailTabs,
  createOverviewTab,
  createHistoryTab,
} from "@/components/detail-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircleIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@repo/api-client";
import { notFound } from "next/navigation";

interface EntityDetailPageProps {
  params: { entityId: string };
}

export default function EntityDetailPage({ params }: EntityDetailPageProps) {
  const { entityId } = params;

  const { data, isLoading, error } = useQuery({
    queryKey: ["entities", entityId],
    queryFn: () => client.entities.get({ path: { id: entityId } }),
  });

  const entity = data?.data;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <BasePage
        breadcrumbs={[
          { title: "Entités", url: "/module/entities" },
          { title: "Chargement..." },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </BasePage>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BasePage
        breadcrumbs={[
          { title: "Entités", url: "/module/entities" },
          { title: "Erreur" },
        ]}
      >
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
          <AlertDescription>
            Impossible de charger cet élément.
          </AlertDescription>
        </Alert>
      </BasePage>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!entity) return notFound();

  // ── Content ──────────────────────────────────────────────────────────────
  return (
    <BasePage
      breadcrumbs={[
        { title: "Entités", url: "/module/entities" },
        { title: entity.name },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title={entity.name}
          variant="detail-card"
          backNavigation={{ href: "/module/entities", label: "Entités" }}
          status={<StatusBadge status={entity.status} />}
          primaryAction={PageHeaderActions.edit(
            `/module/entities/${entityId}/edit`,
          )}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Valeur 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{entity.value1 ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Valeur 2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{entity.value2 ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Valeur 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{entity.value3 ?? "—"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <DetailTabs
          tabs={[
            createOverviewTab(
              <DetailSection title="Informations générales">
                <DetailGrid columns={2}>
                  <DetailItem label="Référence" value={entity.reference} />
                  <DetailItem label="Nom" value={entity.name} />
                  <DetailItem
                    label="Statut"
                    value={<StatusBadge status={entity.status} />}
                  />
                  <DetailItem
                    label="Créé le"
                    value={new Date(entity.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  />
                </DetailGrid>
              </DetailSection>,
            ),
            createHistoryTab(
              <p className="text-sm text-muted-foreground p-4">
                Aucun historique.
              </p>,
            ),
          ]}
        />
      </div>
    </BasePage>
  );
}
```

## Checklist

- [ ] 3 états : loading (Skeleton) / error (Alert) / not-found (notFound())
- [ ] `BasePage` avec breadcrumbs corrects dans chaque état
- [ ] `PageHeader variant="detail-card"` avec `backNavigation`
- [ ] `StatusBadge` dans le header
- [ ] KPI cards si l'entité a des métriques
- [ ] `DetailTabs` pour organiser les sections
- [ ] `DetailSection` + `DetailGrid` + `DetailItem` pour les données
- [ ] Dates formatées en français (`toLocaleDateString("fr-FR")`)
