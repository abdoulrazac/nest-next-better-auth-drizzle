// @ts-nocheck
"use client";

import { MultiSelect } from "@/components/multi-select";
import { authClient } from "@/server/better-auth/client";
import type { Role } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface RoleMultiSelectProps {
  value: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onPermissionsChange?: (permissions: Record<string, string[]>) => void;
}

export function RoleMultiSelect({
  value,
  onValueChange,
  placeholder = "Sélectionner un rôle",
  disabled,
  onPermissionsChange,
}: RoleMultiSelectProps) {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["organization-roles"],
    queryFn: async () => {
      // @ts-expect-error - endpoint pas encore typé pour la récupération des rôles
      const result = await authClient.organization.listRoles();
      return (result.data as Role[]) ?? [];
    },
  });
  const options = (roles || []).map((r) => ({ value: r.role, label: r.role }));

  const handleChange = (selected: string[]) => {
    onValueChange?.(selected);
    if (onPermissionsChange) {
      const selectedRoles =
        roles?.filter((r) => selected.includes(r.role)) || [];
      const mergedPermissions: Record<string, string[]> = {};
      selectedRoles.forEach((role) => {
        const perms =
          typeof role.permission === "string"
            ? JSON.parse(role.permission)
            : role.permission;
        for (const [resource, actions] of Object.entries(perms)) {
          mergedPermissions[resource] = [
            ...(mergedPermissions[resource] || []),
            ...actions,
          ];
        }
      });
      onPermissionsChange(mergedPermissions);
    }
  };

  return (
    <MultiSelect
      options={options}
      value={value}
      onValueChange={handleChange}
      placeholder={placeholder}
      disabled={disabled || isLoading}
    />
  );
}
