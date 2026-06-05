"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableViewOptions } from "@/components/data-table/view-options";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/components/hooks/use-confirm-dialog";
import { Pagination } from "@/components/pagination";
import { PageHeader } from "@/components/page-header";
import TableHeader, {
  createBulkActions,
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import { PlusIcon, TrashIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTableParams } from "@/hooks/use-table-params";
import { useMemo, useState } from "react";
import { buildColumns } from "./columns";
import { RoleDetailSheet } from "./detail-sheet";
import { useDeleteRole, useListRoles } from "./hooks";
import type { OrgRole } from "./types";

export function RolesPage() {
  const {
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
  } = useTableParams({ defaultPageSize: 10 });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrgRole[]>([]);

  const { data, isLoading } = useListRoles({
    search: search || undefined,
  });

  const deleteRole = useDeleteRole();
  const allItems = data?.items ?? [];

  const total = allItems.length;
  const pagedItems = allItems.slice((page - 1) * pageSize, page * pageSize);

  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const handlers = useMemo(
    () => ({
      onView: (role: OrgRole) => setSelectedId(role.id),
      onDelete: async (role: OrgRole) => {
        const ok = await confirm(confirmDialogPresets.delete(`"${role.role}"`));
        if (ok) deleteRole.mutate({ id: role.id });
      },
      onBulkDelete: async (roles: OrgRole[]) => {
        const ok = await confirm(
          confirmDialogPresets.delete(`${roles.length} rôle(s)`),
        );
        if (ok) {
          roles.forEach((r) => deleteRole.mutate({ id: r.id }));
          setSelectedItems([]);
        }
      },
    }),
    [confirm, deleteRole],
  );

  const columns = useMemo(() => buildColumns(handlers), [handlers]);

  const searchConfig = createSearchField(search, setSearch, {
    placeholder: "Rechercher un rôle...",
  });

  const actionsConfig = [createResetButton(resetFilters)];

  const bulkActionsConfig =
    selectedItems.length > 0
      ? createBulkActions(
          selectedItems.length,
          [
            {
              label: "Supprimer",
              icon: <HugeiconsIcon icon={TrashIcon} className="h-4 w-4" />,
              onClick: () => handlers.onBulkDelete(selectedItems),
              variant: "destructive",
            },
          ],
          { onClose: () => setSelectedItems([]) },
        )
      : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rôles"
        description="Gérez les rôles et leurs permissions."
        variant="list"
        primaryAction={{
          label: "Nouveau rôle",
          icon: <HugeiconsIcon icon={PlusIcon} className="h-4 w-4" />,
          href: "/accounts/roles/new",
        }}
      />

      <DataTable
        columns={columns}
        data={pagedItems}
        isLoading={isLoading}
        pagination={false}
        selectable
        onSelectionChange={setSelectedItems}
        emptyMessage="Aucun rôle trouvé."
        toolbar={(table) => (
          <TableHeader
            search={searchConfig}
            actions={actionsConfig}
            bulkActions={bulkActionsConfig}
            extra={<DataTableViewOptions table={table} />}
          />
        )}
      />

      {total > pageSize && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / pageSize)}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {ConfirmDialogComponent}

      <RoleDetailSheet
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        roleId={selectedId}
        handlers={{ onDelete: handlers.onDelete }}
      />
    </div>
  );
}
