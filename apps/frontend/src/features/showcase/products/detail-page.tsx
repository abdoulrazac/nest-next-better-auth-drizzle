// apps/frontend/src/features/showcase/products/detail-page.tsx
"use client";

import {
  DetailGrid,
  DetailItem,
  DetailSection,
  DetailSummary,
} from "@/components/detail-section";
import {
  DetailTabs,
  createActivityTab,
  createDetailsTab,
  createOverviewTab,
} from "@/components/detail-tabs";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/components/hooks/use-confirm-dialog";
import { BasePage } from "@/components/layout/base-page";
import { PageHeader, PageHeaderActions } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircleIcon } from "@/lib/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import { VariantTable } from "./_components/variant-table";
import { productKeys } from "./hooks";
import * as mockStore from "./mock-store";

interface ProductDetailPageProps {
  productId: string;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return mockStore.getProductById(productId) ?? null;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => mockStore.deleteProduct(productId),
    onSuccess: () => {
      toast.success("Produit supprimé");
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      router.push("/showcase/products");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleDelete = async () => {
    const ok = await confirm(confirmDialogPresets.delete(`"${product?.name}"`));
    if (!ok) return;
    await deleteMutation.mutateAsync();
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <BasePage
        breadcrumbs={[
          { title: "Showcase" },
          { title: "Produits", url: "/showcase/products" },
          { title: "Chargement..." },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </BasePage>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BasePage
        breadcrumbs={[
          { title: "Showcase" },
          { title: "Produits", url: "/showcase/products" },
          { title: "Erreur" },
        ]}
      >
        <Alert variant="destructive">
          <Icon icon={AlertCircleIcon} className="h-4 w-4" />
          <AlertDescription>Impossible de charger ce produit.</AlertDescription>
        </Alert>
      </BasePage>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!product) return notFound();

  const variants = mockStore.getVariantsByProductId(productId);
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const stockValue = product.price * product.stock;
  const similarProduct = product.similarProductId
    ? mockStore.getProductById(product.similarProductId)
    : undefined;

  // ── Content ────────────────────────────────────────────────────────────────
  return (
    <BasePage
      breadcrumbs={[
        { title: "Showcase" },
        { title: "Produits", url: "/showcase/products" },
        { title: product.name },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title={product.name}
          description={product.reference}
          variant="detail-card"
          backNavigation={{ href: "/showcase/products", label: "Produits" }}
          status={<StatusBadge status={product.status} />}
          primaryAction={PageHeaderActions.edit(
            `/showcase/products/${productId}/edit`,
          )}
          secondaryActions={[PageHeaderActions.delete(handleDelete)]}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Prix unitaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {product.price.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Stock disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${product.stock === 0 ? "text-destructive" : ""}`}
              >
                {product.stock} unité(s)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Variantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{variants.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <DetailTabs
          tabs={[
            createOverviewTab(
              <DetailSection title="Informations générales">
                <DetailGrid columns={2}>
                  <DetailItem label="Référence" value={product.reference} />
                  <DetailItem label="Catégorie" value={product.category} />
                  <DetailItem
                    label="Prix"
                    value={product.price.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  />
                  <DetailItem
                    label="Stock"
                    value={
                      <span
                        className={
                          product.stock === 0
                            ? "text-destructive font-medium"
                            : undefined
                        }
                      >
                        {product.stock} unité(s)
                      </span>
                    }
                  />
                  <DetailItem
                    label="Statut"
                    value={<StatusBadge status={product.status} />}
                  />
                  <DetailItem
                    label="Créé le"
                    value={new Date(product.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  />
                  {similarProduct && (
                    <DetailItem
                      label="Produit similaire"
                      value={`${similarProduct.name} (${similarProduct.reference})`}
                    />
                  )}
                </DetailGrid>
                {product.description && (
                  <DetailGrid columns={1}>
                    <DetailItem
                      label="Description"
                      value={product.description}
                    />
                  </DetailGrid>
                )}
              </DetailSection>,
            ),
            createDetailsTab(
              <div className="space-y-4">
                <p className="text-sm font-medium">
                  {variants.length} variante(s)
                </p>
                <VariantTable productId={productId} />
              </div>,
            ),
            createActivityTab(
              <DetailSummary
                title="Résumé financier"
                items={[
                  {
                    label: "Valeur du stock",
                    value: stockValue.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }),
                    variant: "success",
                  },
                  {
                    label: "Stock total (variantes)",
                    value: `${totalStock} unité(s)`,
                  },
                  {
                    label: "Variantes actives",
                    value: variants.filter((v) => v.status === "ACTIVE").length,
                  },
                  {
                    label: "Variantes épuisées",
                    value: variants.filter((v) => v.stock === 0).length,
                    variant:
                      variants.filter((v) => v.stock === 0).length > 0
                        ? "destructive"
                        : "default",
                  },
                ]}
              />,
            ),
          ]}
        />
      </div>

      {ConfirmDialogComponent}
    </BasePage>
  );
}
