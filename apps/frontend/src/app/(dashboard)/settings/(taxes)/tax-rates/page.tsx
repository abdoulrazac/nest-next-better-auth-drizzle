// @ts-nocheck
"use client";

import { Pagination } from "@/components/pagination";
import { DataTable, FormDialog } from "@/components/shared";
import PageHeader from "@/components/shared/page-header";
import { Spinner } from "@/components/spinner";
import TableHeader from "@/components/table-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { INavItem } from "@/types";
import { AlertCircle } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";
import { TaxRateFormFields } from "./_components/tax-rate-form";
import { useTaxRatesTable } from "./_components/use-tax-rates-table";

export default function TaxRatesPage() {
  const {
    items,
    total,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    setSelectedItems,
    columns,
    searchConfig,
    filtersConfig,
    actionsConfig,
    bulkActionsConfig,
    form,
    dialogOpen,
    editingId,
    isLoadingEdit,
    openCreate,
    handleDialogOpenChange,
    submitForm,
    isSubmitting,
    ConfirmDialogComponent,
  } = useTaxRatesTable();

  const breadcrumbs = useMemo<INavItem[]>(
    () => [
      { title: "Paramètres", url: "/settings" },
      { title: "Taux de TVA", url: "/settings/tax-rates" },
    ],
    [],
  );

  return (
    <div className="flex flex-col">
      <div className="space-y-6">
        <PageHeader
          title="Taux de TVA"
          description="Gérer les taux de TVA"
          variant="list"
          primaryAction={{
            label: "Nouveau taux de TVA",
            onClick: openCreate,
          }}
        />
        <TableHeader
          actions={actionsConfig}
          bulkActions={bulkActionsConfig}
          filters={filtersConfig}
          search={searchConfig}
        />
        {error && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircle} className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement : {error.message}
            </AlertDescription>
          </Alert>
        )}
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          onSelectionChange={setSelectedItems}
          pagination={false}
          selectable
        />
        {total > 0 && (
          <Pagination
            currentPage={page}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSize={pageSize}
            totalCount={total}
            totalPages={Math.ceil(total / pageSize)}
          />
        )}
      </div>
      <FormDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        title={editingId ? "Modifier le taux de TVA" : "Nouveau taux de TVA"}
        submitLabel={editingId ? "Enregistrer" : "Créer"}
        onSubmit={submitForm}
        isSubmitting={isSubmitting}
      >
        {editingId && isLoadingEdit ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <TaxRateFormFields form={form} />
        )}
      </FormDialog>
      <ConfirmDialogComponent />
    </div>
  );
}
