// @ts-nocheck
"use client";

import { DataTable } from "@/components/shared";
import { DetailItem, DetailSection } from "@/components/shared/detail-section";
import { KpiCard } from "@/components/shared/kpi-card";
import PageHeader from "@/components/shared/page-header";
import { Spinner } from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/server/better-auth/client";
import {
  permissionGroups,
  permissionList,
} from "@/server/better-auth/permission";
import type { INavItem } from "@/types";
import type { MemberWithRelations } from "@/types/accounts";
import {
  Calendar01Icon,
  KeyIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback } from "react";
import { toast } from "sonner";
import { createColumns } from "../../users/_components/columns";

export default function RoleDetailPage() {
  const params = useParams();
  const roleId = params.roleId as string;

  const {
    data: role,
    isPending: isLoading,
    isError,
  } = useQuery({
    queryKey: ["organization-role", roleId],
    queryFn: async () => {
      // @ts-expect-error - endpoint pas encore typé pour la récupération d'un rôle
      const result = await authClient.organization.getRole({
        query: { roleId },
      });
      return result.data;
    },
    enabled: !!roleId,
  });

  const {
    data: members = [],
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ["organization-members-by-role", role?.role],
    queryFn: async () => {
      const result = await authClient.organization.listMembers({
        query: {
          filterField: "role",
          filterOperator: "contains",
          filterValue: role!.role,
        },
      });
      return (result.data?.members as MemberWithRelations[]) ?? [];
    },
    enabled: !!role?.role,
  });

  const roleLabel = role?.role ?? "Détails du rôle";

  const handleRemoveMember = useCallback(
    async (member: MemberWithRelations) => {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: member.id,
      });
      if (error) {
        toast.error(error.message || "Impossible de retirer ce membre.");
        return;
      }
      toast.success("Membre retiré avec succès.");
      await refetchMembers();
    },
    [refetchMembers],
  );

  const breadcrumbs: INavItem[] = [
    { title: "Administration", url: "/accounts" },
    { title: "Rôles", url: "/accounts/roles" },
    { title: roleLabel, url: `/accounts/roles/${roleId}` },
  ];

  const tabValues = ["overview", "permissions", "members"] as const;
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabValues).withDefault("overview"),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Impossible de charger les données du rôle.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backNavigation={{ href: "/accounts/roles" }}
        description={`Membres: ${members.length}`}
        status={{ label: "Actif", variant: "outline" }}
        title={roleLabel}
        variant="detail"
        primaryAction={{
          label: "Modifier",
          href: `/accounts/roles/${roleId}/edit`,
        }}
      />

      <Tabs
        className="space-y-4"
        value={tab}
        onValueChange={(v) => setTab(v as (typeof tabValues)[number])}
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-2xl">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="members">Membres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <KpiCard
                title="Membres"
                value={members.length}
                icon={UserGroupIcon}
                variant="primary"
                loading={membersLoading}
              />
              <KpiCard
                title="Groupes de permissions"
                value={
                  role?.permission ? Object.keys(role.permission).length : 0
                }
                icon={KeyIcon}
                variant="default"
              />
              <KpiCard
                title="Créé le"
                value={
                  role?.createdAt
                    ? new Date(role.createdAt).toLocaleDateString("fr-FR")
                    : "—"
                }
                icon={Calendar01Icon}
                variant="default"
              />
            </div>

            {/* Detail info */}
            <DetailSection title="Informations générales">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem label="Identifiant" value={roleId} />
                <DetailItem label="Libellé" value={roleLabel} />
                {role?.description && (
                  <DetailItem
                    label="Description"
                    value={role.description}
                    className="sm:col-span-2"
                  />
                )}
              </div>
            </DetailSection>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="flex flex-col gap-4">
            {!role?.permission || Object.keys(role.permission).length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Aucune permission assignée à ce rôle.
                </CardContent>
              </Card>
            ) : (
              Object.entries(permissionGroups).map(([groupKey, group]) => {
                const groupItems = Object.entries(permissionList).filter(
                  ([, per]) => per.group === groupKey,
                );
                const hasGranted = groupItems.some(
                  ([subKey]) => (role?.permission?.[subKey] ?? []).length > 0,
                );
                if (!hasGranted) return null;
                return (
                  <Card key={groupKey}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{group.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      {groupItems.map(([subKey, subGroup], i) => {
                        const granted = role?.permission?.[subKey] ?? [];
                        if (granted.length === 0) return null;
                        return (
                          <div key={subKey}>
                            {i > 0 && <Separator className="mb-4 md:hidden" />}
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {subGroup.title}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {subGroup.permissions.map((perm) => (
                                <Badge
                                  key={perm}
                                  variant={
                                    granted.includes(perm)
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    !granted.includes(perm) ? "opacity-25" : ""
                                  }
                                >
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <DataTable
            columns={createColumns({ onRemoveUser: handleRemoveMember })}
            data={members}
            isLoading={membersLoading}
            pagination={false}
            emptyMessage="Aucun membre assigné à ce rôle."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
