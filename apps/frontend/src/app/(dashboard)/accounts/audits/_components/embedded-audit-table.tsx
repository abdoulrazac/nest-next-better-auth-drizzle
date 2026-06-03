// @ts-nocheck
"use client";

import { Pagination } from "@/components/pagination";
import { DataTable } from "@/components/shared/data-table";
import SingleSelect from "@/components/single-select";
import TableHeader, {
  createFilterField,
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import { api } from "@/trpc/react";
import { AuditAction, Severity } from "@/types/enums";
import { useCallback, useMemo, useState } from "react";
import { auditColumns, type AuditLogRow } from "./audit-columns";

interface EmbeddedAuditTableProps {
  /** Pre-filter by userId (for user detail pages) */
  userId?: string;
  /** Hide the user column when viewing a single user's logs */
  hideUserColumn?: boolean;
  /** Use getMyLogs instead of getAll (for non-admin users) */
  myLogsOnly?: boolean;
}

export function EmbeddedAuditTable({
  userId,
  hideUserColumn,
  myLogsOnly,
}: EmbeddedAuditTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [severityFilter, setSeverityFilter] = useState<
    "" | "INFO" | "WARNING" | "CRITICAL"
  >("");
  const [actionFilter, setActionFilter] = useState<"" | string>("");
  const [moduleFilter, setModuleFilter] = useState<"" | string>("");

  const queryInput = {
    skip: (page - 1) * pageSize,
    take: pageSize,
    userId: userId || undefined,
    severity: (severityFilter as "INFO" | "WARNING" | "CRITICAL") || undefined,
    action: actionFilter || undefined,
    module: moduleFilter || undefined,
  };

  const getAllQuery = api.common.audit.getAll.useQuery(queryInput, {
    enabled: !myLogsOnly,
  });

  const getMyLogsQuery = api.common.audit.getMyLogs.useQuery(queryInput, {
    enabled: !!myLogsOnly,
  });

  const { data, isLoading } = myLogsOnly ? getMyLogsQuery : getAllQuery;

  const logs = (data?.data as AuditLogRow[]) ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Columns
  const columns = useMemo(
    () => auditColumns({ hideUserColumn }),
    [hideUserColumn],
  );

  // Filters
  const handleSeverityChange = useCallback((v: string) => {
    setSeverityFilter(v as "" | "INFO" | "WARNING" | "CRITICAL");
    setPage(1);
  }, []);

  const handleActionChange = useCallback((v: string) => {
    setActionFilter(v);
    setPage(1);
  }, []);

  const handleModuleChange = useCallback((v: string) => {
    setModuleFilter(v);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerm("");
    setSeverityFilter("");
    setActionFilter("");
    setModuleFilter("");
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const searchConfig = useMemo(
    () =>
      createSearchField(searchTerm, handleSearchChange, {
        placeholder: "Rechercher...",
      }),
    [searchTerm, handleSearchChange],
  );

  const filtersConfig = useMemo(
    () => [
      createFilterField(
        "severity",
        <SingleSelect
          btnClassName="min-w-32"
          onValueChange={handleSeverityChange}
          options={[
            { value: Severity.INFO, label: "Information" },
            { value: Severity.WARNING, label: "Avertissement" },
            { value: Severity.CRITICAL, label: "Critique" },
          ]}
          placeholder="Sévérité"
          value={severityFilter}
        />,
      ),
      createFilterField(
        "action",
        <SingleSelect
          btnClassName="min-w-32"
          onValueChange={handleActionChange}
          options={[
            { value: AuditAction.LOGIN, label: "Connexion" },
            { value: AuditAction.LOGOUT, label: "Déconnexion" },
            { value: AuditAction.CREATE, label: "Création" },
            { value: AuditAction.UPDATE, label: "Modification" },
            { value: AuditAction.DELETE, label: "Suppression" },
            { value: AuditAction.EXPORT, label: "Export" },
            { value: AuditAction.PRINT, label: "Impression" },
            { value: AuditAction.VIEW, label: "Consultation" },
          ]}
          placeholder="Action"
          value={actionFilter}
        />,
      ),
      createFilterField(
        "module",
        <SingleSelect
          btnClassName="min-w-32"
          onValueChange={handleModuleChange}
          options={[
            { value: "auth", label: "Authentification" },
            { value: "sales", label: "Ventes" },
            { value: "purchases", label: "Achats" },
            { value: "inventory", label: "Inventaire" },
            { value: "settings", label: "Paramètres" },
            { value: "accounts", label: "Comptes" },
          ]}
          placeholder="Module"
          value={moduleFilter}
        />,
      ),
    ],
    [
      severityFilter,
      handleSeverityChange,
      actionFilter,
      handleActionChange,
      moduleFilter,
      handleModuleChange,
    ],
  );

  const actionsConfig = useMemo(
    () => [createResetButton(handleReset)],
    [handleReset],
  );

  const handlePageSizeChange = useCallback((s: number) => {
    setPageSize(s);
    setPage(1);
  }, []);

  return (
    <div className="space-y-4">
      <TableHeader
        search={searchConfig}
        filters={filtersConfig}
        actions={actionsConfig}
      />

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="Aucun log d'audit trouvé"
        pagination={false}
      />

      {totalPages > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
