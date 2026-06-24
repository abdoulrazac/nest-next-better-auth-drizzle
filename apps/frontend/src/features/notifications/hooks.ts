import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      const { data, error } = await apiClient.v1.notificationsFindAll({
        query: params,
      });
      if (error) throw error;
      return data as unknown as NotificationsPaginatedResponse;
    },
    staleTime: 30_000,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await apiClient.v1.notificationsMarkAsRead({
        body: { ids: [id] },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
    onError: () => toast.error("Failed to mark as read"),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.v1.notificationsMarkAllAsRead();
      if (error) throw error;
      return data;
    },
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
    mutationFn: async (id: string) => {
      const { data, error } = await apiClient.v1.notificationsRemove({
        path: { id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification deleted");
    },
    onError: () => toast.error("Failed to delete notification"),
  });
}

export type { Notification };
