// @ts-nocheck
"use client";

import { Pagination } from "@/components/pagination";
import { DataTable, FormDialog } from "@/components/shared";
import PageHeader from "@/components/shared/page-header";
import { Spinner } from "@/components/spinner";
import TableHeader from "@/components/table-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { INavItem } from "@/types";
import { AlertCircle, Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";
import { FiscalYearFormFields } from "./_components/fiscal-year-form";
import { useFiscalYears } from "./_components/use-fiscal-years";

export default function FiscalYearsPage() {
  const {
    items,
    total,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    columns,
    searchConfig,
    form,
    dialogOpen,
    editingId,
    isLoadingEdit,
    openCreate,
    handleDialogOpenChange,
    submitForm,
    isSubmitting,
    ConfirmDialogComponent,
  } = useFiscalYears();

  const breadcrumbs = useMemo<INavItem[]>(
    () => [
      { title: "Paramètres", url: "/settings" },
      { title: "Exercices fiscaux", url: "/settings/fiscal-years" },
    ],
    [],
  );

  return (
    <div className="flex flex-col">
      <div className="space-y-6">
        <PageHeader
          title="Exercices fiscaux"
          description="Gérer les exercices fiscaux de votre organisation"
          variant="list"
          primaryAction={{
            label: "Nouvel exercice",
            onClick: openCreate,
            icon: <HugeiconsIcon icon={Plus} className="h-4 w-4" />,
          }}
        />
        <TableHeader search={searchConfig} />
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
          pagination={false}
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
          editingId ? "Modifier l'exercice fiscal" : "Nouvel exercice fiscal"
        }
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
          <FiscalYearFormFields form={form} />
        )}
      </FormDialog>

      <ConfirmDialogComponent />
    </div>
  );
}
