// apps/frontend/src/features/showcase/products/index.tsx
"use client";

import { BasePage } from "@/components/layout/base-page";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/pagination";
import { PageHeader, PageHeaderActions } from "@/components/page-header";
import TableHeader from "@/components/table-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@/lib/icons";
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

        <TableHeader
          search={searchConfig}
          filters={filtersConfig}
          actions={actionsConfig}
          bulkActions={bulkActionsConfig}
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
