"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "./stat-card";
import { ActivityFeed } from "./activity-feed";
import { UsersIcon, RoleIcon, FileIcon, WebhookIcon } from "@/lib/icons";

interface AuditLogEntry {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

function useTotalCount(queryKey: string, path: string) {
  return useQuery({
    queryKey: [queryKey, "count"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await (apiClient.get as any)(path, {
        query: { pageSize: 1 },
      })) as { total?: number; meta?: { total?: number } };
      return res?.total ?? res?.meta?.total ?? 0;
    },
  });
}

function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs", "recent"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await (apiClient.get as any)("/v1/audit-logs", {
        query: { pageSize: 10 },
      })) as {
        data?: AuditLogEntry[];
        items?: AuditLogEntry[];
      };
      return res?.data ?? res?.items ?? [];
    },
  });
}

export function DashboardPage() {
  const users = useTotalCount("users", "/v1/accounts/users");
  const roles = useTotalCount("roles", "/v1/roles");
  const files = useTotalCount("files", "/v1/files");
  const auditLogs = useAuditLogs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your application's activity and resources."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={users.data ?? 0}
          icon={UsersIcon}
          isLoading={users.isLoading}
        />
        <StatCard
          title="Active Roles"
          value={roles.data ?? 0}
          icon={RoleIcon}
          isLoading={roles.isLoading}
        />
        <StatCard
          title="Files Uploaded"
          value={files.data ?? 0}
          icon={FileIcon}
          isLoading={files.isLoading}
        />
        <StatCard
          title="Webhook Events"
          value="—"
          icon={WebhookIcon}
          description="Last 30 days"
          isLoading={false}
        />
      </div>

      <ActivityFeed
        entries={auditLogs.data ?? []}
        isLoading={auditLogs.isLoading}
      />
    </div>
  );
}
