import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { AuditLogsPaginatedResponse } from "./types";

export const auditKeys = {
  all: ["audit-logs"] as const,
  list: (params?: object) => [...auditKeys.all, "list", params] as const,
};

export function useListAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  action?: string;
  resource?: string;
}) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.auditLogsFindAll({
        query: {
          page: params?.page,
          limit: params?.pageSize,
          action: params?.action,
        },
      });
      if (error) throw error;
      return data as unknown as AuditLogsPaginatedResponse;
    },
    staleTime: 60_000,
  });
}
