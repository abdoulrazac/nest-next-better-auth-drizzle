// @ts-nocheck
"use client";

import { EmbeddedAuditTable } from "@/app/(admin)/accounts/audits/_components/embedded-audit-table";
import BasePage from "@/components/layout/base-page";
import PageHeader from "@/components/shared/page-header";
import { Spinner } from "@/components/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/server/better-auth/client";
import type { INavItem } from "@/types";
import type { MemberWithRelations } from "@/types/accounts";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;

  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["organization-members", userId],
    queryFn: async () => {
      const result = await authClient.organization.listMembers({
        query: {
          filterField: "id",
          filterOperator: "eq",
          filterValue: userId,
          limit: 1,
          offset: 0,
        },
      });
      return (result.data?.members as MemberWithRelations[]) ?? [];
    },
    enabled: !!userId,
  });

  const member = members[0];

  const tabValues = ["profil", "logs"] as const;
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabValues).withDefault("profil"),
  );

  const breadcrumbs: INavItem[] = [
    { title: "Administration", url: "/accounts" },
    { title: "Utilisateurs", url: "/accounts/users" },
    {
      title: member?.user?.name ?? "Détails utilisateur",
      url: `/accounts/users/${userId}`,
    },
  ];

  if (isLoading) {
    return (
      <BasePage breadcrumbs={breadcrumbs} variant="compact">
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      </BasePage>
    );
  }

  if (!member) {
    return (
      <BasePage breadcrumbs={breadcrumbs} variant="compact">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {isError
              ? "Erreur lors du chargement de l'utilisateur."
              : "Utilisateur introuvable."}
          </CardContent>
        </Card>
      </BasePage>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backNavigation={{ href: "/accounts/users" }}
        description={member.user.email}
        status={{ label: "Actif", variant: "outline" }}
        title={member.user.name || "Utilisateur"}
        variant="detail"
      />

      <Tabs
        className="space-y-4"
        value={tab}
        onValueChange={(v) => setTab(v as (typeof tabValues)[number])}
      >
        <TabsList className="flex">
          <TabsTrigger value="profil" className="w-40">
            Profil
          </TabsTrigger>
          <TabsTrigger value="logs" className="w-40">
            Logs d'activité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          <Card>
            <CardContent className="grid gap-2 py-6 text-sm md:grid-cols-2">
              <p>
                <span className="font-medium">Nom:</span>{" "}
                {member.user.name || "-"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {member.user.email || "-"}
              </p>
              <p>
                <span className="font-medium">Rôle:</span> {member.role || "-"}
              </p>
              <p>
                <span className="font-medium">Créé le:</span>{" "}
                {member.createdAt
                  ? new Date(member.createdAt).toLocaleDateString("fr-FR")
                  : "-"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <EmbeddedAuditTable userId={member.userId} hideUserColumn />
        </TabsContent>
      </Tabs>
    </div>
  );
}
