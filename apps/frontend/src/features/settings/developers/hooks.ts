import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type {
  WebhookResponse,
  WebhooksPaginatedResponse,
  CreateWebhookInput,
  UpdateWebhookInput,
} from "@repo/validators/webhooks";

export const webhookKeys = {
  all: ["webhooks"] as const,
  list: () => [...webhookKeys.all, "list"] as const,
  detail: (id: string) => [...webhookKeys.all, "detail", id] as const,
};

export function useListWebhooks() {
  return useQuery({
    queryKey: webhookKeys.list(),
    queryFn: async () => {
      const res = (await apiClient.get({ url: "/v1/webhooks" })) as any;
      return res.data as WebhooksPaginatedResponse;
    },
    staleTime: 30_000,
  });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWebhookInput) =>
      apiClient.post({ url: "/v1/webhooks", body: data }) as any,
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
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookInput }) =>
      apiClient.patch({ url: `/v1/webhooks/${id}`, body: data }) as any,
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
    mutationFn: (id: string) =>
      apiClient.delete({ url: `/v1/webhooks/${id}` }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.all });
      toast.success("Webhook supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
