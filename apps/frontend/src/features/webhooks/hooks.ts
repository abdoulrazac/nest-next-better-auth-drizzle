import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Webhook,
  WebhookDelivery,
  WebhooksPaginatedResponse,
} from "./types";

export const webhookKeys = {
  all: ["webhooks"] as const,
  list: (params?: object) => [...webhookKeys.all, "list", params] as const,
  detail: (id: string) => [...webhookKeys.all, "detail", id] as const,
  deliveries: (webhookId: string) =>
    [...webhookKeys.all, "deliveries", webhookId] as const,
};

export function useListWebhooks(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: webhookKeys.list(params),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.webhooksFindAll({
        query: {
          page: params?.page,
          limit: params?.pageSize,
        },
      });
      if (error) throw error;
      return data as unknown as WebhooksPaginatedResponse;
    },
    staleTime: 30_000,
  });
}

export function useGetWebhook(
  id: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: webhookKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.webhooksFindOne({
        path: { id: id as string },
      });
      if (error) throw error;
      return data as unknown as Webhook;
    },
    enabled: !!id && (options?.enabled ?? true),
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
      toast.success("Webhook created");
    },
    onError: () => toast.error("Failed to create webhook"),
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
      toast.success("Webhook updated");
    },
    onError: () => toast.error("Failed to update webhook"),
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
      toast.success("Webhook deleted");
    },
    onError: () => toast.error("Failed to delete webhook"),
  });
}

export function useGetWebhookDeliveries(webhookId: string) {
  return useQuery({
    queryKey: webhookKeys.deliveries(webhookId),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.webhooksGetDeliveries({
        path: { id: webhookId },
      });
      if (error) throw error;
      return (data as unknown as WebhookDelivery[]) ?? [];
    },
    enabled: !!webhookId,
    staleTime: 10_000,
  });
}
