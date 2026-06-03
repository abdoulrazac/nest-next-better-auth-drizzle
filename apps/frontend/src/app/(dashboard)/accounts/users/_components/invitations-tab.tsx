// @ts-nocheck
"use client";

import { Pagination } from "@/components/pagination";
import { DataTable } from "@/components/shared";
import TableHeader, {
  createBulkActions,
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import { authClient } from "@/server/better-auth/client";
import { api } from "@/trpc/react";
import type { MemberInvitationWithRelations } from "@/types/accounts";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createInvitationColumns } from "./columns";

export function InvitationsTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvitations, setSelectedInvitations] = useState<
    MemberInvitationWithRelations[]
  >([]);

  const utils = api.useUtils();

  const { data: invitationsData, isLoading } =
    api.accounts.userManagement.getInvitations.useQuery({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: searchTerm || undefined,
    });

  const invitations =
    (invitationsData?.data as MemberInvitationWithRelations[]) || [];
  const total = invitationsData?.total ?? 0;

  const handleCancel = async (invitationId: string) => {
    const { error } = await authClient.organization.cancelInvitation({
      invitationId,
    });
    if (error) {
      toast.error(error.message || "Impossible d'annuler cette invitation.");
      return;
    }
    void utils.accounts.userManagement.getInvitations.invalidate();
    toast.success("Invitation annulée.");
  };

  const bulkActions = useMemo(() => {
    const count = selectedInvitations.length;
    if (count === 0) return undefined;
    return createBulkActions(
      count,
      [
        {
          label: "Annuler",
          icon: <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />,
          onClick: async () => {
            const results = await Promise.allSettled(
              selectedInvitations.map((inv) =>
                authClient.organization.cancelInvitation({
                  invitationId: inv.id,
                }),
              ),
            );
            const success = results.filter(
              (r) => r.status === "fulfilled",
            ).length;
            const failed = results.length - success;
            if (success > 0) {
              toast.success(`${success} invitation(s) annulée(s).`);
              void utils.accounts.userManagement.getInvitations.invalidate();
            }
            if (failed > 0) toast.error(`${failed} annulation(s) échouée(s).`);
            setSelectedInvitations([]);
          },
          tooltip: "Annuler les invitations",
          size: "sm" as const,
          variant: "destructive" as const,
        },
      ],
      { onClose: () => setSelectedInvitations([]) },
    );
  }, [selectedInvitations, utils]);

  return (
    <div className="flex flex-col gap-4">
      <TableHeader
        search={createSearchField(
          searchTerm,
          (v) => {
            setSearchTerm(v);
            setPage(1);
          },
          {
            placeholder: "Rechercher par email...",
          },
        )}
        actions={[
          createResetButton(() => {
            setSearchTerm("");
            setPage(1);
          }),
        ]}
        bulkActions={bulkActions}
      />

      <DataTable
        columns={createInvitationColumns(handleCancel)}
        data={invitations}
        isLoading={isLoading}
        pagination={false}
        selectable
        onSelectionChange={setSelectedInvitations}
        emptyMessage="Aucune invitation ne correspond à vos critères de recherche."
      />

      {total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / pageSize)}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
            setSelectedInvitations([]);
          }}
        />
      )}
    </div>
  );
}
