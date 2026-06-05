"use client";

import { RoleForm } from "@/features/roles/role-form";
import { useGetRole } from "@/features/roles/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { use } from "react";

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default function EditRolePage({ params }: EditRolePageProps) {
  const { id } = use(params);
  const { data: role, isLoading } = useGetRole(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-16 w-80" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return <RoleForm role={role} />;
}
