// apps/frontend/src/features/showcase/products/edit-page.tsx
"use client";

import {
  FormActions,
  FormSelectField,
  FormTextareaField,
  FormTextField,
} from "@/components/form";
import { FormSection } from "@/components/form/form-section";
import { BasePage } from "@/components/layout/base-page";
import { PageHeader } from "@/components/page-header";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { PRODUCT_CATEGORIES } from "@repo/validators/products";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProductSelect } from "./_components/product-select";
import { productKeys } from "./hooks";
import * as mockStore from "./mock-store";
import { productFormSchema, type ProductFormValues } from "./schema";

interface ProductEditPageProps {
  productId: string;
}

export function ProductEditPage({ productId }: ProductEditPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return mockStore.getProductById(productId) ?? null;
    },
  });

  const form = useForm<ProductFormValues>({
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

  useEffect(() => {
    if (product) {
      form.reset({
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
  }, [product, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: ProductFormValues) => {
    try {
      await mockStore.updateProduct(productId, values);
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produit mis à jour");
      router.push(`/showcase/products/${productId}`);
    } catch {
      toast.error("Erreur lors de la mise à jour");
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
        {
          title: product?.name ?? "Modifier",
          url: `/showcase/products/${productId}`,
        },
        { title: "Modifier" },
      ]}
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <PageHeader
            title={`Modifier — ${product?.name ?? ""}`}
            variant="edit"
            backNavigation={{
              href: `/showcase/products/${productId}`,
              label: "Fiche produit",
            }}
          />

          <FormSection title="Informations générales">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormTextField
                form={form}
                name="name"
                label="Nom"
                required
                disabled={isSubmitting}
              />
              <FormTextField
                form={form}
                name="reference"
                label="Référence"
                required
                disabled={isSubmitting}
              />
              <FormSelectField
                form={form}
                name="category"
                label="Catégorie"
                required
                variant="single"
                options={PRODUCT_CATEGORIES.map((c) => ({
                  value: c,
                  label: c,
                }))}
                placeholder="Sélectionner une catégorie"
                disabled={isSubmitting}
              />
              <FormSelectField
                form={form}
                name="status"
                label="Statut"
                required
                variant="single"
                options={[
                  { value: "ACTIVE", label: "Actif" },
                  { value: "INACTIVE", label: "Inactif" },
                  { value: "DRAFT", label: "Brouillon" },
                  { value: "OUT_OF_STOCK", label: "Rupture de stock" },
                ]}
                disabled={isSubmitting}
              />
            </div>
          </FormSection>

          <FormSection title="Tarification & Stock">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Champ numérique — FormTextField ne supporte pas type="number" */}
              <Field>
                <FieldLabel htmlFor="price">Prix (€) *</FieldLabel>
                <Controller
                  control={form.control}
                  name="price"
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isSubmitting}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="stock">Stock *</FieldLabel>
                <Controller
                  control={form.control}
                  name="stock"
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isSubmitting}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </>
                  )}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Description & Liens">
            <div className="space-y-4">
              <FormTextareaField
                form={form}
                name="description"
                label="Description"
                rows={3}
                disabled={isSubmitting}
              />
              {/* Champ avec composant de recherche personnalisé */}
              <Field>
                <FieldLabel>Produit similaire</FieldLabel>
                <Controller
                  control={form.control}
                  name="similarProductId"
                  render={({ field, fieldState }) => (
                    <>
                      <ProductSelect
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        excludeId={productId}
                        disabled={isSubmitting}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Optionnel — associez un produit similaire pour la
                  recommandation.
                </p>
              </Field>
            </div>
          </FormSection>

          <FormActions
            variant="page"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            submitLabel="Mettre à jour"
            submitLoadingLabel="Mise à jour..."
            onCancel={() => router.push(`/showcase/products/${productId}`)}
          />
        </div>
      </form>
    </BasePage>
  );
}
