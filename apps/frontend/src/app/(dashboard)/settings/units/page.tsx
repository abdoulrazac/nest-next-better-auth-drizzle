// @ts-nocheck
"use client";

import BasePage from "@/components/layout/base-page";
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
import { UnitFormFields } from "./_components/unit-form";
import { useUnitsTable } from "./_components/use-units-table";

export default function UnitsPage() {
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
  } = useUnitsTable();

  const breadcrumbs = useMemo<INavItem[]>(
    () => [
      { title: "Paramètres", url: "/settings" },
      { title: "Unités", url: "/settings/units" },
    ],
    [],
  );

  return (
    <BasePage breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <PageHeader
          title="Unités"
          description="Gérer les unités de mesure"
          variant="list"
          primaryAction={{
            label: "Nouvelle unité",
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
        title={editingId ? "Modifier l'unité" : "Nouvelle unité"}
        submitLabel={editingId ? "Enregistrer" : "Créer"}
        onSubmit={submitForm}
        isSubmitting={isSubmitting}
        size="lg"
      >
        {editingId && isLoadingEdit ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <UnitFormFields form={form} />
        )}
      </FormDialog>
      <ConfirmDialogComponent />
    </BasePage>
  );
}
