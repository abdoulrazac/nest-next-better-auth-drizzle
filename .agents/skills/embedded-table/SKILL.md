---
name: embedded-table
description: "Template for the centralised hook pattern (hooks.ts) and embedded table thin consumer. Use when adding a related entity table inside a detail page tab. The centralised hook owns all mutations, handlers, and ConfirmDialog — the embedded table and detail sheet receive handlers via props."
---

# Embedded Table Scaffold

## Pattern: Centralised Hook

`hooks.ts` est la **seule source de vérité** pour mutations + handlers + state.
La list page, l'embedded table, et la detail sheet consomment tous les mêmes `handlers`.

```
hooks.ts
└─ owns: mutations, handlers, state, ConfirmDialogComponent
     ↓ passes handlers via props
     ├─ index.tsx (list page)
     ├─ detail-sheet.tsx (reçoit handlers via props)
     └─ embedded-<entity>-table.tsx (reçoit handlers + parentId via props)
```

## Shared vs Differs

|               | List page       | Embedded table | Detail sheet   |
| ------------- | --------------- | -------------- | -------------- |
| Mutations     | ✅ du hook      | du hook parent | du hook parent |
| Handlers      | ✅ du hook      | props          | props          |
| ConfirmDialog | ✅ rendu 1 fois | non (délégué)  | non (délégué)  |
| Pagination    | ✅ séparée      | optionnelle    | non            |
| Filtres       | ✅ tous         | parentId seul  | non            |
| Sélection     | ✅              | optionnelle    | non            |

## Embedded Table Component

```tsx
"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/pagination";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { buildEntityColumns } from "../columns";
import type { EntityHandlers } from "../hooks";

interface EmbeddedEntityTableProps {
  parentId: string;
  handlers: EntityHandlers;
}

export function EmbeddedEntityTable({
  parentId,
  handlers,
}: EmbeddedEntityTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["entities", "byParent", parentId, page, pageSize],
    queryFn: async () => {
      const { data, error } = await apiClient.v1.entitiesFindAll({
        query: { page, limit: pageSize },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!parentId,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const columns = buildEntityColumns(handlers);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        pagination={false}
        emptyMessage="Aucun élément lié."
      />
      {total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / pageSize)}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
```

## Export EntityHandlers type from hooks.ts

```ts
// Dans hooks.ts, exporter le type des handlers
export type EntityHandlers = ReturnType<typeof useEntity>["handlers"];
```

## Usage dans une tab de detail page

```tsx
// Dans detail-page tabs
createOverviewTab(
  <EmbeddedEntityTable parentId={entityId} handlers={handlers} />,
);
```

## Checklist

- [ ] Hook centralisé exporte `EntityHandlers` type
- [ ] Embedded table reçoit `handlers` via props — aucune mutation propre
- [ ] `enabled: !!parentId` sur la query
- [ ] `pagination={false}` sur DataTable + `<Pagination />` séparée si total > 0
- [ ] `emptyMessage` en français
