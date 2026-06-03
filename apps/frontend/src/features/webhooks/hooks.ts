import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
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
      const res = (await apiClient.get({
        url: "/v1/webhooks",
        query: params,
      })) as any;
      return res as WebhooksPaginatedResponse;
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
      const res = (await apiClient.get({ url: `/v1/webhooks/${id}` })) as any;
      return res as Webhook;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.post({ url: "/v1/webhooks", body: data }) as any,
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
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch({ url: `/v1/webhooks/${id}`, body: data }) as any,
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
    mutationFn: (id: string) =>
      apiClient.delete({ url: `/v1/webhooks/${id}` }) as any,
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
      const res = (await apiClient.get({
        url: `/v1/webhooks/${webhookId}/deliveries`,
      })) as any;
      return res as WebhookDelivery[];
    },
    enabled: !!webhookId,
    staleTime: 10_000,
  });
}
