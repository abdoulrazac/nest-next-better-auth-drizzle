// @ts-nocheck
"use client";

import PageHeader from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import type { MemberWithRelations } from "@/types/accounts";
import { SentIcon, Users as UsersIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import CreateUserForm from "./_components/create-user-form";
import { InvitationsTab } from "./_components/invitations-tab";
import InviteForm from "./_components/invite-form";
import { MembersTab } from "./_components/members-tab";
import UpdateRoleForm from "./_components/update-role-form";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"members" | "invitations">(
    "members",
  );
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedMemberForRole, setSelectedMemberForRole] =
    useState<MemberWithRelations | null>(null);

  const utils = api.useUtils();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comptes utilisateurs"
        description="Gérez les utilisateurs et leurs accès"
        variant="list"
        primaryAction={{
          label: "Créer un compte",
          icon: <HugeiconsIcon icon={UsersIcon} />,
          onClick: () => setOpenCreateDialog(true),
          loading: false,
        }}
        secondaryActions={[
          {
            label: "Inviter par email",
            icon: <HugeiconsIcon icon={SentIcon} />,
            onClick: () => setOpenInviteDialog(true),
            loading: false,
            variant: "outline",
          },
        ]}
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "members" | "invitations")}
        className="w-full gap-6"
      >
        <TabsList className="w-80" variant={"line"}>
          <TabsTrigger value="members">
            <HugeiconsIcon icon={UsersIcon} className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
            Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTab onUpdateRole={setSelectedMemberForRole} />
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationsTab />
        </TabsContent>
      </Tabs>

      <InviteForm
        open={openInviteDialog}
        onOpenChange={() => setOpenInviteDialog(!openInviteDialog)}
        onSuccess={() => {
          setOpenInviteDialog(false);
          void utils.accounts.userManagement.getInvitations.invalidate();
        }}
        onCancel={() => setOpenInviteDialog(false)}
      />

      <CreateUserForm
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
        onSuccess={() =>
          void utils.accounts.userManagement.getMembers.invalidate()
        }
      />

      <UpdateRoleForm
        open={!!selectedMemberForRole}
        onOpenChange={(open) => {
          if (!open) setSelectedMemberForRole(null);
        }}
        member={selectedMemberForRole}
        onSuccess={() => {
          setSelectedMemberForRole(null);
          void utils.accounts.userManagement.getMembers.invalidate();
        }}
      />
    </div>
  );
}
