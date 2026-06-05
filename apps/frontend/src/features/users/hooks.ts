import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User, UsersPaginatedResponse } from "./types";

export const userKeys = {
  all: ["users"] as const,
  list: (params?: object) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export function useListUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const res = (await apiClient.get({
        url: "/v1/accounts/users",
        query: params,
      })) as any;
      return res.data as UsersPaginatedResponse;
    },
    staleTime: 30_000,
  });
}

export function useGetUser(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: async () => {
      const res = (await apiClient.get({
        url: `/v1/accounts/users/${id}`,
      })) as any;
      return res.data as User;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.post({ url: "/v1/accounts/users", body: data }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Utilisateur créé avec succès");
    },
    onError: () => toast.error("Impossible de créer l'utilisateur"),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch({ url: `/v1/accounts/users/${id}`, body: data }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Utilisateur mis à jour");
    },
    onError: () => toast.error("Impossible de modifier l'utilisateur"),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete({ url: `/v1/accounts/users/${id}` }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Utilisateur supprimé");
    },
    onError: () => toast.error("Impossible de supprimer l'utilisateur"),
  });
}
