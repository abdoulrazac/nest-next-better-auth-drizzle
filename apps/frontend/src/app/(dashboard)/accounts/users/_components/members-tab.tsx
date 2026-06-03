// @ts-nocheck
"use client";

import { Pagination } from "@/components/pagination";
import { DataTable } from "@/components/shared";
import TableHeader, {
  createBulkActions,
  createFilterField,
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import { authClient } from "@/server/better-auth/client";
import { api } from "@/trpc/react";
import type { MemberWithRelations } from "@/types/accounts";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RoleMultiSelect } from "../../roles/_components/role-multi-select";
import { createColumns } from "./columns";

interface Props {
  onUpdateRole: (member: MemberWithRelations) => void;
}

export function MembersTab({ onUpdateRole }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<MemberWithRelations[]>(
    [],
  );

  const utils = api.useUtils();

  const { data, isLoading } = api.accounts.userManagement.getMembers.useQuery({
    skip: (page - 1) * pageSize,
    take: pageSize,
    search: searchTerm || undefined,
    roles: roleFilter.length > 0 ? roleFilter : undefined,
  });

  const members = (data?.data as MemberWithRelations[]) || [];
  const total = data?.total ?? 0;

  const handleRemove = async (member: MemberWithRelations) => {
    const { error } = await authClient.organization.removeMember({
      memberIdOrEmail: member.id,
    });
    if (error) {
      toast.error(error.message || "Impossible de retirer ce membre.");
      return;
    }
    void utils.accounts.userManagement.getMembers.invalidate();
    toast.success("Membre retiré avec succès.");
  };

  const bulkActions = useMemo(() => {
    const count = selectedMembers.length;
    if (count === 0) return undefined;
    return createBulkActions(
      count,
      [
        {
          label: "Retirer",
          icon: <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />,
          onClick: async () => {
            const results = await Promise.allSettled(
              selectedMembers.map((m) =>
                authClient.organization.removeMember({ memberIdOrEmail: m.id }),
              ),
            );
            const success = results.filter(
              (r) => r.status === "fulfilled",
            ).length;
            const failed = results.length - success;
            if (success > 0) {
              toast.success(`${success} membre(s) retiré(s).`);
              void utils.accounts.userManagement.getMembers.invalidate();
            }
            if (failed > 0) toast.error(`${failed} suppression(s) échouée(s).`);
            setSelectedMembers([]);
          },
          tooltip: "Retirer les membres de l'organisation",
          size: "sm" as const,
          variant: "destructive" as const,
        },
      ],
      { onClose: () => setSelectedMembers([]) },
    );
  }, [selectedMembers, utils]);

  return (
    <div className="flex flex-col gap-4">
      <TableHeader
        search={createSearchField(
          searchTerm,
          (v) => {
            setSearchTerm(v);
            setPage(1);
          },
          {
            placeholder: "Rechercher par nom ou email...",
          },
        )}
        filters={[
          createFilterField(
            "role",
            <RoleMultiSelect
              value={roleFilter}
              onValueChange={(values) => {
                setRoleFilter(values);
                setPage(1);
              }}
              placeholder="Filtrer par rôle"
            />,
          ),
        ]}
        actions={[
          createResetButton(() => {
            setSearchTerm("");
            setRoleFilter([]);
            setPage(1);
          }),
        ]}
        bulkActions={bulkActions}
      />

      <DataTable
        columns={createColumns({ onUpdateRole, onRemoveUser: handleRemove })}
        data={members}
        isLoading={isLoading}
        pagination={false}
        selectable
        onSelectionChange={setSelectedMembers}
        emptyMessage="Aucun utilisateur ne correspond à vos critères de recherche."
      />

      {total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / pageSize)}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
            setSelectedMembers([]);
          }}
        />
      )}
    </div>
  );
}
