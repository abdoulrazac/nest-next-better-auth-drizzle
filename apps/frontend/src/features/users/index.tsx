"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableViewOptions } from "@/components/data-table/view-options";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/components/hooks/use-confirm-dialog";
import { Pagination } from "@/components/pagination";
import { PageHeader } from "@/components/page-header";
import SingleSelect from "@/components/single-select";
import TableHeader, {
  createBulkActions,
  createFilterField,
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import { PlusIcon, TrashIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTableParams } from "@/hooks/use-table-params";
import { useMemo, useState } from "react";
import { buildColumns } from "./columns";
import { UserDetailSheet } from "./detail-sheet";
import { useDeleteUser, useListUsers } from "./hooks";
import { MutateUserDialog } from "./mutate-dialog";
import type { User } from "./types";

const STATUS_OPTIONS = [
  { value: "active", label: "Actif" },
  { value: "banned", label: "Banni" },
];

export function UsersPage() {
  const {
    search,
    setSearch,
    getFilter,
    setFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
  } = useTableParams({ filterKeys: ["status"] });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<User[]>([]);

  const { data, isLoading } = useListUsers({
    page,
    pageSize,
    search: search || undefined,
    status: getFilter("status") || undefined,
  });

  const deleteUser = useDeleteUser();
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const handlers = useMemo(
    () => ({
      onView: (user: User) => setSelectedId(user.id),
      onEdit: (user: User) => {
        setEditTarget(user);
        setDialogOpen(true);
      },
      onDelete: async (user: User) => {
        const ok = await confirm(confirmDialogPresets.delete(`"${user.name}"`));
        if (ok) deleteUser.mutate(user.id);
      },
      onBulkDelete: async (users: User[]) => {
        const ok = await confirm(
          confirmDialogPresets.delete(`${users.length} utilisateur(s)`),
        );
        if (ok) {
          users.forEach((u) => deleteUser.mutate(u.id));
          setSelectedItems([]);
        }
      },
    }),
    [confirm, deleteUser],
  );

  const columns = useMemo(() => buildColumns(handlers), [handlers]);

  const searchConfig = createSearchField(search, setSearch, {
    placeholder: "Rechercher un utilisateur...",
  });

  const filtersConfig = [
    createFilterField(
      "status",
      <SingleSelect
        value={getFilter("status")}
        onValueChange={(v) => setFilter("status", v)}
        options={STATUS_OPTIONS}
        placeholder="Statut"
        btnClassName="min-w-32"
      />,
    ),
  ];

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
        title="Utilisateurs"
        description="Gérez les utilisateurs de l'application."
        variant="list"
        primaryAction={{
          label: "Nouvel utilisateur",
          icon: <HugeiconsIcon icon={PlusIcon} className="h-4 w-4" />,
          onClick: () => {
            setEditTarget(null);
            setDialogOpen(true);
          },
        }}
      />

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        pagination={false}
        selectable
        onSelectionChange={setSelectedItems}
        emptyMessage="Aucun utilisateur trouvé."
        toolbar={(table) => (
          <TableHeader
            search={searchConfig}
            filters={filtersConfig}
            actions={actionsConfig}
            bulkActions={bulkActionsConfig}
            extra={<DataTableViewOptions table={table} />}
          />
        )}
      />

      {total > 0 && (
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

      <MutateUserDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditTarget(null);
        }}
        user={editTarget}
      />

      <UserDetailSheet
        userId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        handlers={handlers}
      />
    </div>
  );
}
