import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { AuditLog, AuditLogsPaginatedResponse } from "./types";

export const auditKeys = {
  all: ["audit-logs"] as const,
  list: (params?: object) => [...auditKeys.all, "list", params] as const,
};

export function useListAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  action?: string;
}) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: async () => {
      const res = await (apiClient.get as any)("/v1/audit-logs", {
        query: params,
      });
      return res as AuditLogsPaginatedResponse;
    },
    staleTime: 60_000,
  });
}
