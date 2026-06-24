import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { WebhooksPaginatedResponse } from "@repo/validators/webhooks";

export const webhookKeys = {
  all: ["webhooks"] as const,
  list: () => [...webhookKeys.all, "list"] as const,
  detail: (id: string) => [...webhookKeys.all, "detail", id] as const,
};

export function useListWebhooks() {
  return useQuery({
    queryKey: webhookKeys.list(),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.webhooksFindAll({});
      if (error) throw error;
      return data as unknown as WebhooksPaginatedResponse;
    },
    staleTime: 30_000,
  });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      url: string;
      events: string[];
      secret?: string;
    }) => {
      const { data: res, error } = await apiClient.v1.webhooksCreate({
        body: data,
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.all });
      toast.success("Webhook créé");
    },
    onError: () => toast.error("Erreur lors de la création du webhook"),
  });
}

export function useUpdateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        url?: string;
        events?: string[];
        secret?: string;
      };
    }) => {
      const { data: res, error } = await apiClient.v1.webhooksUpdate({
        path: { id },
        body: data,
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.all });
      toast.success("Webhook mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: res, error } = await apiClient.v1.webhooksRemove({
        path: { id },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.all });
      toast.success("Webhook supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
