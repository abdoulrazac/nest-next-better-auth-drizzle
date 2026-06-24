// apps/frontend/src/features/showcase/products/detail-sheet.tsx
"use client";

import {
  DetailGrid,
  DetailItem,
  DetailSection,
} from "@/components/detail-section";
import {
  DetailTabs,
  createDetailsTab,
  createOverviewTab,
} from "@/components/detail-tabs";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EditIcon, ExternalLinkIcon } from "@/lib/icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { VariantTable } from "./_components/variant-table";
import type { ProductHandlers } from "./hooks";
import { productKeys } from "./hooks";
import * as mockStore from "./mock-store";

interface ProductDetailSheetProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handlers: ProductHandlers;
}

export function ProductDetailSheet({
  productId,
  open,
  onOpenChange,
  handlers,
}: ProductDetailSheetProps) {
  const router = useRouter();

  const { data: product, isLoading } = useQuery({
    queryKey: productKeys.detail(productId ?? ""),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return mockStore.getProductById(productId!) ?? null;
    },
    enabled: open && !!productId,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-[500px] sm:w-[580px] sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2 min-w-0">
              {isLoading ? (
                <>
                  <SheetTitle className="sr-only">Chargement...</SheetTitle>
                  <Skeleton className="h-6 w-48" />
                </>
              ) : (
                <>
                  <SheetTitle className="truncate">{product?.name}</SheetTitle>
                  {product && <StatusBadge status={product.status} />}
                </>
              )}
            </div>
            {!isLoading && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/showcase/products/${productId}`);
                  }}
                  title="Voir la fiche complète"
                >
                  <Icon icon={ExternalLinkIcon} className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    if (productId) handlers.onEdit(productId);
                  }}
                >
                  <Icon icon={EditIcon} className="h-4 w-4" />
                  Modifier
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : product ? (
          <div className="p-6">
            <DetailTabs
              tabs={[
                createOverviewTab(
                  <DetailSection title="Informations">
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
                    <p className="text-sm font-medium">Variantes</p>
                    <VariantTable productId={product.id} />
                  </div>,
                ),
              ]}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
