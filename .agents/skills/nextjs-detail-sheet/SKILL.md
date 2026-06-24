---
name: detail-sheet
description: "Scaffold a detail sheet (slide-over panel) for an entity. Sheet receives handlers via props from the centralised hook — no duplicated mutations or ConfirmDialog. Use when adding a quick-view panel to a list page."
---

# Detail Sheet Scaffold

## Pattern

La detail sheet ne possède PAS de mutations. Elle reçoit `handlers` du hook centralisé via props.

## Template

```tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import {
  DetailSection,
  DetailGrid,
  DetailItem,
} from "@/components/detail-section";
import {
  DetailTabs,
  createOverviewTab,
  createHistoryTab,
} from "@/components/detail-tabs";
import { Button } from "@/components/ui/button";
import { EditIcon } from "@/lib/icons";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import type { EntityHandlers } from "./hooks";

interface EntityDetailSheetProps {
  entityId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handlers: EntityHandlers;
}

export function EntityDetailSheet({
  entityId,
  open,
  onOpenChange,
  handlers,
}: EntityDetailSheetProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["entities", entityId],
    queryFn: async () => {
      const { data, error } = await apiClient.v1.entitiesFindOne({
        path: { id: entityId! },
      });
      if (error) throw error;
      return data;
    },
    enabled: open && !!entityId,
  });

  const entity = data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <div className="flex items-center justify-between gap-2 pr-6">
              <div className="flex items-center gap-2">
                <SheetTitle>{entity?.name}</SheetTitle>
                {entity && <StatusBadge status={entity.status} />}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/module/entities/${entityId}/edit`);
                }}
              >
                <Icon icon={EditIcon} className="h-4 w-4" />
                Modifier
              </Button>
            </div>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : entity ? (
          <div className="p-6">
            <DetailTabs
              tabs={[
                createOverviewTab(
                  <DetailSection title="Informations">
                    <DetailGrid columns={2}>
                      <DetailItem label="Référence" value={entity.reference} />
                      <DetailItem label="Nom" value={entity.name} />
                      <DetailItem
                        label="Statut"
                        value={<StatusBadge status={entity.status} />}
                      />
                    </DetailGrid>
                  </DetailSection>,
                ),
                createHistoryTab(
                  <p className="text-sm text-muted-foreground">
                    Aucun historique.
                  </p>,
                ),
              ]}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
```

## Integration dans la list page

```tsx
<EntityDetailSheet
  entityId={selectedId}
  open={!!selectedId}
  onOpenChange={(open) => {
    if (!open) setSelectedId(null);
  }}
  handlers={handlers} // ← vient du hook centralisé, PAS de mutations dans le sheet
/>
```

## Checklist

- [ ] `enabled: open && !!entityId` sur la query
- [ ] Pas de mutations dans le sheet (handlers via props)
- [ ] Pas de ConfirmDialog dans le sheet (délégué au hook parent)
- [ ] `SheetContent` avec `overflow-y-auto`
- [ ] 3 états : loading (Skeleton) / data / null
- [ ] `DetailTabs` pour organiser le contenu
