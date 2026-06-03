"use client";

import { useState, useMemo } from "react";
import { type Table } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DataTableBulkActionBar } from "@/components/data-table/bulk-action-bar";
import PageHeader from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Input } from "@/components/ui/input";
import { ShieldUserIcon, TrashIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { buildColumns } from "./columns";
import { MutateRoleDialog } from "./mutate-dialog";
import { RoleDetailSheet } from "./detail-sheet";
import { useListRoles, useDeleteRole } from "./hooks";
import type { Role } from "./types";

export function RolesPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetRoleId, setSheetRoleId] = useState<string | null>(null);

  const { data, isLoading } = useListRoles({ search: search || undefined });
  const deleteRole = useDeleteRole();

  const roles = data?.items ?? [];

  const columns = useMemo(
    () =>
      buildColumns({
        onView: (role) => {
          setSheetRoleId(role.id);
          setSheetOpen(true);
        },
        onEdit: (role) => {
          setEditTarget(role);
          setDialogOpen(true);
        },
        onDelete: (role) => {
          setDeleteId(role.id);
        },
      }),
    [],
  );

  function handleOpenCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) setEditTarget(null);
  }

  function handleDeleteConfirm() {
    if (!deleteId) return;
    deleteRole.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError: () => setDeleteId(null),
    });
  }

  function toolbar(table: Table<Role>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const deletableRows = selectedRows;
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search roles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-[200px]"
        />
        {deletableRows.length > 0 && (
          <DataTableBulkActionBar
            selectedCount={deletableRows.length}
            onClearSelection={() => table.resetRowSelection()}
            actions={[
              {
                label: "Delete selected",
                icon: TrashIcon,
                variant: "destructive",
                onClick: () => {
                  deletableRows.forEach((row) => {
                    deleteRole.mutate((row.original as Role).id);
                  });
                  table.resetRowSelection();
                },
              },
            ]}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage roles and their permissions."
        primaryAction={{
          label: "New Role",
          icon: <HugeiconsIcon icon={ShieldUserIcon} className="h-4 w-4" />,
          onClick: handleOpenCreate,
        }}
      />

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        toolbar={toolbar}
      />

      <MutateRoleDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        role={editTarget}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete role"
        description="Are you sure you want to delete this role? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isPending={deleteRole.isPending}
      />

      <RoleDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        roleId={sheetRoleId}
        onEdit={(role) => {
          setSheetOpen(false);
          setEditTarget(role);
          setDialogOpen(true);
        }}
        onDelete={(role) => {
          setSheetOpen(false);
          setDeleteId(role.id);
        }}
      />
    </div>
  );
}
