// apps/frontend/src/features/showcase/products/edit-page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BasePage } from "@/components/layout/base-page";
import { PageHeader, PageHeaderActions } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/form-section";
import SingleSelect from "@/components/single-select";
import { CategorySelect } from "./_components/category-select";
import { ProductSelect } from "./_components/product-select";
import * as mockStore from "./mock-store";
import { productFormSchema, type ProductFormValues } from "./schema";
import { productKeys } from "./hooks";

interface ProductEditPageProps {
  productId: string;
}

export function ProductEditPage({ productId }: ProductEditPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return mockStore.getProductById(productId) ?? null;
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productFormSchema as any) as any,
    defaultValues: {
      name: "",
      reference: "",
      category: undefined,
      price: 0,
      stock: 0,
      status: "DRAFT",
      description: "",
      similarProductId: undefined,
    },
  });

  // Pré-remplir le formulaire quand le produit est chargé
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        reference: product.reference,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: product.status,
        description: product.description ?? "",
        similarProductId: product.similarProductId ?? undefined,
      });
    }
  }, [product, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await mockStore.updateProduct(productId, values);
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produit mis à jour");
      router.push(`/showcase/products/${productId}`);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </BasePage>
    );
  }

  return (
    <BasePage
      breadcrumbs={[
        { title: "Showcase" },
        { title: "Produits", url: "/showcase/products" },
        { title: product?.name ?? "Modifier" },
        { title: "Modifier" },
      ]}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <PageHeader
            title={`Modifier — ${product?.name ?? ""}`}
            variant="edit"
            backNavigation={{
              href: `/showcase/products/${productId}`,
              label: "Fiche produit",
            }}
            primaryAction={PageHeaderActions.save(
              handleSubmit(onSubmit),
              isSubmitting,
            )}
            secondaryActions={[
              PageHeaderActions.cancel(`/showcase/products/${productId}`),
            ]}
          />

          <FormSection title="Informations générales">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference">Référence *</Label>
                <Input id="reference" {...register("reference")} />
                {errors.reference && (
                  <p className="text-xs text-destructive">
                    {errors.reference.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Catégorie *</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <CategorySelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    />
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Statut *</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <SingleSelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      options={[
                        { value: "ACTIVE", label: "Actif" },
                        { value: "INACTIVE", label: "Inactif" },
                        { value: "DRAFT", label: "Brouillon" },
                        { value: "OUT_OF_STOCK", label: "Rupture de stock" },
                      ]}
                      placeholder="Statut"
                      btnClassName="w-full"
                    />
                  )}
                />
                {errors.status && (
                  <p className="text-xs text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Tarification & Stock">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  {...register("stock")}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Description & Liens">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  {...register("description")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Produit similaire</Label>
                <Controller
                  control={control}
                  name="similarProductId"
                  render={({ field }) => (
                    <ProductSelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      excludeId={productId}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Optionnel — associez un produit similaire pour la
                  recommandation.
                </p>
              </div>
            </div>
          </FormSection>
        </div>
      </form>
    </BasePage>
  );
}
