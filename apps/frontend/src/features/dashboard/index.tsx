"use client";

import { PageHeader } from "@/components/page-header";
import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ActivityFeed } from "./activity-feed";
import { StatCard } from "./stat-card";
import { FileIcon, RoleIcon, UsersIcon, WebhookIcon } from "@/lib/icons";

interface AuditLogEntry {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

function useTotalCount(queryKey: string, fetcher: () => Promise<number>) {
  return useQuery({
    queryKey: [queryKey, "count"],
    queryFn: async () => fetcher(),
  });
}

export function DashboardPage() {
  const users = useTotalCount("users", async () => {
    const { data, error } = await apiClient.v1.usersFindAll({
      query: { limit: 1 },
    });
    if (error) throw error;
    return data?.total ?? 0;
  });
  const roles = useTotalCount("roles", async () => {
    // roles list is not paginated — it returns the full array
    const { data, error } = await apiClient.v1.rolesFindAll();
    if (error) throw error;
    return (data as unknown as { id: string }[] | undefined)?.length ?? 0;
  });
  const files = useTotalCount("files", async () => {
    const { data, error } = await apiClient.v1.filesFindAll({
      query: { limit: 1 },
    });
    if (error) throw error;
    return data?.total ?? 0;
  });

  const auditLogs = useQuery({
    queryKey: ["audit-logs", "recent"],
    queryFn: async () => {
      const { data, error } = await apiClient.v1.auditLogsFindAll({
        query: { limit: 10 },
      });
      if (error) throw error;
      return (data?.items ?? []) as unknown as AuditLogEntry[];
    },
  });

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
