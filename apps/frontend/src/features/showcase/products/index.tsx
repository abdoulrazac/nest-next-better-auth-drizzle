// apps/frontend/src/features/showcase/products/index.tsx
"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableViewOptions } from "@/components/data-table/view-options";
import { BasePage } from "@/components/layout/base-page";
import { PageHeader, PageHeaderActions } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import TableHeader from "@/components/table-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ProductDetailSheet } from "./detail-sheet";
import { useProducts } from "./hooks";

export function ProductsListPage() {
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
    selectedId,
    setSelectedId,
    handlers,
    columns,
    searchConfig,
    filtersConfig,
    actionsConfig,
    bulkActionsConfig,
    ConfirmDialogComponent,
  } = useProducts();

  return (
    <BasePage
      breadcrumbs={[
        { title: "Showcase" },
        { title: "Produits", url: "/showcase/products" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Produits"
          description="Gérez votre catalogue de produits."
          variant="list"
          primaryAction={PageHeaderActions.create(
            "/showcase/products/new",
            "Nouveau produit",
          )}
        />

        {error && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertDescription>
              Erreur : {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          pagination={false}
          selectable
          onSelectionChange={setSelectedItems}
          emptyMessage="Aucun produit trouvé."
          toolbar={(table) => (
            <TableHeader
              search={searchConfig}
              filters={filtersConfig}
              actions={actionsConfig}
              bulkActions={bulkActionsConfig}
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
            onPageSizeChange={setPageSize} // setPageSize auto-remet la page à 1
          />
        )}
      </div>

      {ConfirmDialogComponent}

      <ProductDetailSheet
        productId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        handlers={handlers}
      />
    </BasePage>
  );
}
