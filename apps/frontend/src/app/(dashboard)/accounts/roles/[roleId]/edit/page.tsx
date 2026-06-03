// @ts-nocheck
"use client";

import { Spinner } from "@/components/spinner";
import { authClient } from "@/server/better-auth/client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import RoleForm from "../../_components/role-form";

export default function EditRolePage() {
  const params = useParams();
  const roleId = params.roleId as string;

  const {
    data: role,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["organization-role", roleId],
    queryFn: async () => {
      // @ts-expect-error - endpoint pas encore typé pour la récupération d'un rôle
      const result = await authClient.organization.getRole({
        query: { roleId },
      });
      return result.data;
    },
    enabled: !!roleId,
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !role) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Impossible de charger les données du rôle.
      </div>
    );
  }

  return <RoleForm role={role} />;
}
