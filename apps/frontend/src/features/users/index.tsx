"use client";

import { useState, useMemo } from "react";
import { type Table } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DataTableBulkActionBar } from "@/components/data-table/bulk-action-bar";
import PageHeader from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlusIcon, TrashIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { buildColumns } from "./columns";
import { MutateUserDialog } from "./mutate-dialog";
import { UserDetailSheet } from "./detail-sheet";
import { useListUsers, useDeleteUser } from "./hooks";
import type { User } from "./types";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetUserId, setSheetUserId] = useState<string | null>(null);

  const params = {
    search: search || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading } = useListUsers(params);
  const deleteUser = useDeleteUser();

  const users = data?.items ?? [];

  const columns = useMemo(
    () =>
      buildColumns({
        onView: (user) => {
          setSheetUserId(user.id);
          setSheetOpen(true);
        },
        onEdit: (user) => {
          setEditTarget(user);
          setDialogOpen(true);
        },
        onDelete: (user) => setDeleteId(user.id),
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
    deleteUser.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError: () => setDeleteId(null),
    });
  }

  function toolbar(table: Table<User>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-[200px]"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
        {selectedRows.length > 0 && (
          <DataTableBulkActionBar
            selectedCount={selectedRows.length}
            onClearSelection={() => table.resetRowSelection()}
            actions={[
              {
                label: "Delete selected",
                icon: TrashIcon,
                variant: "destructive",
                onClick: () => {
                  // bulk delete: iterate selected
                  selectedRows.forEach((row) => {
                    deleteUser.mutate((row.original as User).id);
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
        title="Users"
        description="Manage your application users."
        primaryAction={{
          label: "New User",
          icon: <HugeiconsIcon icon={UserPlusIcon} className="h-4 w-4" />,
          onClick: handleOpenCreate,
        }}
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        toolbar={toolbar}
      />

      <MutateUserDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        user={editTarget}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete user"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isPending={deleteUser.isPending}
      />

      <UserDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        userId={sheetUserId}
        onEdit={(user) => {
          setSheetOpen(false);
          setEditTarget(user);
          setDialogOpen(true);
        }}
        onDelete={(user) => {
          setSheetOpen(false);
          setDeleteId(user.id);
        }}
      />
    </div>
  );
}
