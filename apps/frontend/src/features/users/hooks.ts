import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
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
      toast.success("User created");
    },
    onError: () => toast.error("Failed to create user"),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch({ url: `/v1/accounts/users/${id}`, body: data }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User updated");
    },
    onError: () => toast.error("Failed to update user"),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete({ url: `/v1/accounts/users/${id}` }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User deleted");
    },
    onError: () => toast.error("Failed to delete user"),
  });
}
