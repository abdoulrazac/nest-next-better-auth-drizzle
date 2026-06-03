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
import { SpecificTaxFormFields } from "./_components/specific-tax-form";
import { useSpecificTaxesTable } from "./_components/use-specific-taxes-table";

export default function SpecificTaxesPage() {
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
  } = useSpecificTaxesTable();

  const breadcrumbs = useMemo<INavItem[]>(
    () => [
      { title: "Achats", url: "/purchases" },
      { title: "Taxes spécifiques", url: "/purchases/specific-taxes" },
    ],
    [],
  );

  return (
    <div className="flex flex-col">
      <div className="space-y-6">
        <PageHeader
          title="Taxes spécifiques"
          description="Gérer les taxes spécifiques appliquées aux produits"
          variant="list"
          primaryAction={{
            label: "Nouvelle taxe spécifique",
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
        title={
          editingId ? "Modifier la taxe spécifique" : "Nouvelle taxe spécifique"
        }
        submitLabel={editingId ? "Enregistrer" : "Créer"}
        onSubmit={submitForm}
        isSubmitting={isSubmitting}
      >
        {editingId && isLoadingEdit ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <SpecificTaxFormFields form={form} />
        )}
      </FormDialog>
      <ConfirmDialogComponent />
    </div>
  );
}
