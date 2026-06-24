import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UsersPaginatedResponse,
} from "./types";

export const userKeys = {
  all: ["users"] as const,
  list: (params?: object) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export function useListUsers(
  params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.usersFindAll({
        query: {
          page: params?.page,
          limit: params?.pageSize,
          search: params?.search,
        },
      });
      if (error) throw error;
      return data as unknown as UsersPaginatedResponse;
    },
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useGetUser(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.usersFindOne({
        path: { id: id as string },
      });
      if (error) throw error;
      return data as unknown as User;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const { data: res, error } = await apiClient.auth.createUser({
        body: data,
      });
      if (error) throw error;
      return res;
    },
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const { data: res, error } = await apiClient.v1.usersUpdate({
        path: { id },
        body: data,
      });
      if (error) throw error;
      return res;
    },
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
    mutationFn: async (id: string) => {
      const { data: res, error } = await apiClient.auth.removeUser({
        body: { userId: id },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Utilisateur supprimé");
    },
    onError: () => toast.error("Impossible de supprimer l'utilisateur"),
  });
}
