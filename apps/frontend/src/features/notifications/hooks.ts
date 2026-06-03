import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { Notification, NotificationsPaginatedResponse } from "./types";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: object) => [...notificationKeys.all, "list", params] as const,
};

export function useListNotifications(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const res = (await apiClient.get({
        url: "/v1/notifications",
        query: params,
      })) as any;
      return res as NotificationsPaginatedResponse;
    },
    staleTime: 30_000,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch({ url: `/v1/notifications/${id}/read` }) as any,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
    onError: () => toast.error("Failed to mark as read"),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.patch({ url: "/v1/notifications/read-all" }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete({ url: `/v1/notifications/${id}` }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification deleted");
    },
    onError: () => toast.error("Failed to delete notification"),
  });
}
