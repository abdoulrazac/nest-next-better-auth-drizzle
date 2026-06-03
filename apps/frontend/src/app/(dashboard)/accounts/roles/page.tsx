// @ts-nocheck
"use client";

import { DataTable } from "@/components/shared";
import PageHeader, { PageHeaderActions } from "@/components/shared/page-header";
import TableHeader, {
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import { authClient } from "@/server/better-auth/client";
import type { Role } from "@/types/accounts";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createColumns } from "./_components/columns";

export default function RolesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: roles, isLoading } = useQuery({
    queryKey: ["organization-roles"],
    queryFn: async () => {
      // @ts-expect-error - endpoint pas encore typé pour la récupération des rôles
      const result = await authClient.organization.listRoles();
      return (result.data as Role[]) ?? [];
    },
  });

  const filteredRoles = useMemo(() => {
    if (!searchTerm) return roles || [];
    return (roles || []).filter((role) =>
      role.role.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [roles, searchTerm]);

  const handleEdit = (role: Role) => {
    router.push(`/accounts/roles/${role.id}/edit`);
  };

  const handleDelete = async (role: Role) => {
    // @ts-expect-error - endpoint pas encore typé pour la suppression d'un rôle
    const data = await authClient.organization.deleteRole({ roleId: role.id });
    if (data.success) {
      toast.success("Rôle supprimé avec succès.");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rôles"
        description="Gérez les rôles et permissions des utilisateurs"
        variant="list"
        primaryAction={PageHeaderActions.create(
          "/accounts/roles/new",
          "Ajouter un rôle",
        )}
      />

      <TableHeader
        search={createSearchField(searchTerm, setSearchTerm, {
          placeholder: "Rechercher par nom...",
        })}
        actions={[
          createResetButton(() => {
            setSearchTerm("");
          }),
        ]}
      />
      <DataTable
        columns={createColumns({
          onUpdateRole: handleEdit,
          onDeleteRole: handleDelete,
        })}
        data={filteredRoles}
        isLoading={isLoading}
        pagination={false}
        emptyMessage="Aucun rôle ne correspond à vos critères de recherche."
      />
    </div>
  );
}
