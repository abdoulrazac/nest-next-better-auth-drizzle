"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { useListAuditLogs } from "./hooks";
import { auditLogColumns } from "./columns";
import { AuditLogsToolbar } from "./toolbar";

export function AuditLogsPage() {
  const { data, isLoading } = useListAuditLogs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="All system actions are recorded here."
      />
      <DataTable
        columns={auditLogColumns}
        data={data?.items ?? []}
        isLoading={isLoading}
        toolbar={(table) => <AuditLogsToolbar table={table} />}
      />
    </div>
  );
}
