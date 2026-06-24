import { apiClient } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OrgRole } from "./types";

export const roleKeys = {
  all: ["roles"] as const,
  list: (params?: object) => [...roleKeys.all, "list", params] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
  permissions: ["roles", "permissions"] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────

export function useListRoles(params?: {
  search?: string;
  organizationId?: string;
}) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: async () => {
      const { data, error } = await authClient.organization.listRoles({
        query: params?.organizationId
          ? { organizationId: params.organizationId }
          : undefined,
      });
      if (error)
        throw new Error(error.message ?? "Erreur lors du chargement des rôles");
      const items = (data ?? []) as OrgRole[];
      const filtered = params?.search
        ? items.filter((r) =>
            r.role.toLowerCase().includes(params.search!.toLowerCase()),
          )
        : items;
      return { items: filtered, total: filtered.length };
    },
    staleTime: 30_000,
  });
}

// ─── Get (detail) ─────────────────────────────────────────────────────────────

export function useGetRole(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: roleKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data, error } = await authClient.organization.getRole({
        query: { roleId: id! },
      });
      if (error) throw new Error(error.message ?? "Rôle introuvable");
      return data as OrgRole;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      role: string;
      permission: Record<string, string[]>;
      organizationId?: string;
    }) => {
      const { data, error } = await authClient.organization.createRole({
        role: payload.role,
        permission: payload.permission,
        ...(payload.organizationId
          ? { organizationId: payload.organizationId }
          : {}),
      });
      if (error)
        throw new Error(error.message ?? "Impossible de créer le rôle");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      toast.success("Rôle créé avec succès");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      data: { roleName?: string; permission?: Record<string, string[]> };
      organizationId?: string;
    }) => {
      const { data, error } = await authClient.organization.updateRole({
        roleId: payload.id,
        data: payload.data,
        ...(payload.organizationId
          ? { organizationId: payload.organizationId }
          : {}),
      });
      if (error)
        throw new Error(error.message ?? "Impossible de modifier le rôle");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      toast.success("Rôle mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; organizationId?: string }) => {
      const { error } = await authClient.organization.deleteRole({
        roleId: payload.id,
        ...(payload.organizationId
          ? { organizationId: payload.organizationId }
          : {}),
      });
      if (error)
        throw new Error(error.message ?? "Impossible de supprimer le rôle");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      toast.success("Rôle supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Permissions catalogue ─────────────────────────────────────────────────────

/**
 * Fetches the full resource→actions map from the backend.
 * Used by the role form to know which permissions are available.
 */
export function useGetPermissions() {
  return useQuery({
    queryKey: roleKeys.permissions,
    queryFn: async () => {
      const { data, error } = await apiClient.v1.rolesGetPermissions();
      if (error) throw new Error("Impossible de charger les permissions");
      return (data ?? {}) as Record<string, string[]>;
    },
    staleTime: Infinity, // static data — never refetch automatically
  });
}
