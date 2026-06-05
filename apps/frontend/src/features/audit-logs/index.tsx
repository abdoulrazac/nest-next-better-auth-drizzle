"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableViewOptions } from "@/components/data-table/view-options";
import { Pagination } from "@/components/pagination";
import { PageHeader } from "@/components/page-header";
import SingleSelect from "@/components/single-select";
import TableHeader, {
  createFilterField,
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import { useState } from "react";
import { auditLogColumns } from "./columns";
import { useListAuditLogs } from "./hooks";

const ACTION_OPTIONS = [
  { value: "user.login", label: "Connexion" },
  { value: "user.logout", label: "Déconnexion" },
  { value: "user.created", label: "Utilisateur créé" },
  { value: "user.updated", label: "Utilisateur modifié" },
  { value: "user.deleted", label: "Utilisateur supprimé" },
  { value: "role.created", label: "Rôle créé" },
  { value: "role.updated", label: "Rôle modifié" },
  { value: "role.deleted", label: "Rôle supprimé" },
];

const RESOURCE_OPTIONS = [
  { value: "users", label: "Utilisateurs" },
  { value: "roles", label: "Rôles" },
  { value: "audit-logs", label: "Journaux" },
  { value: "settings", label: "Paramètres" },
];

export function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useListAuditLogs({
    page,
    pageSize,
    search: search || undefined,
    action: actionFilter || undefined,
    resource: resourceFilter || undefined,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const searchConfig = createSearchField(
    search,
    (v) => {
      setSearch(v);
      setPage(1);
    },
    { placeholder: "Rechercher..." },
  );

  const filtersConfig = [
    createFilterField(
      "action",
      <SingleSelect
        value={actionFilter}
        onValueChange={(v) => {
          setActionFilter(v);
          setPage(1);
        }}
        options={ACTION_OPTIONS}
        placeholder="Action"
        btnClassName="min-w-36"
      />,
    ),
    createFilterField(
      "resource",
      <SingleSelect
        value={resourceFilter}
        onValueChange={(v) => {
          setResourceFilter(v);
          setPage(1);
        }}
        options={RESOURCE_OPTIONS}
        placeholder="Ressource"
        btnClassName="min-w-36"
      />,
    ),
  ];

  const actionsConfig = [
    createResetButton(() => {
      setSearch("");
      setActionFilter("");
      setResourceFilter("");
      setPage(1);
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'audit"
        description="Historique complet des actions effectuées dans l'application."
        variant="list"
      />

      <DataTable
        columns={auditLogColumns}
        data={items}
        isLoading={isLoading}
        pagination={false}
        emptyMessage="Aucun log d'audit trouvé."
        toolbar={(table) => (
          <TableHeader
            search={searchConfig}
            filters={filtersConfig}
            actions={actionsConfig}
            extra={<DataTableViewOptions table={table} />}
          />
        )}
      />

      {total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / pageSize)}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
