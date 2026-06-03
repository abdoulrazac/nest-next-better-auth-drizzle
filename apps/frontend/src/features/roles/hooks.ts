import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { Role, RolesPaginatedResponse } from "./types";

export const roleKeys = {
  all: ["roles"] as const,
  list: (params?: object) => [...roleKeys.all, "list", params] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

export function useListRoles(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: async () => {
      const res = (await apiClient.get({
        url: "/v1/roles",
        query: params,
      })) as any;
      return res.data as RolesPaginatedResponse;
    },
    staleTime: 30_000,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.post({ url: "/v1/roles", body: data }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      toast.success("Role created");
    },
    onError: () => toast.error("Failed to create role"),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch({ url: `/v1/roles/${id}`, body: data }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete({ url: `/v1/roles/${id}` }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      toast.success("Role deleted");
    },
    onError: () => toast.error("Failed to delete role"),
  });
}
