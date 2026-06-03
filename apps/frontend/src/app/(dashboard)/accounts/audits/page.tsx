"use client";

import PageHeader from "@/components/shared/page-header";
import { EmbeddedAuditTable } from "./_components/embedded-audit-table";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        backNavigation={false}
        description="Historique complet des actions effectuées dans l'application"
        title="Journal d'audit"
        variant="list"
      />
      <EmbeddedAuditTable />
    </div>
  );
}
