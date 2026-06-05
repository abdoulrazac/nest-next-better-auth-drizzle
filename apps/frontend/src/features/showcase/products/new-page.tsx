// apps/frontend/src/features/showcase/products/new-page.tsx
"use client";

import { FormSection } from "@/components/form-section";
import {
  FormActions,
  FormSelectField,
  FormTextareaField,
  FormTextField,
} from "@/components/form";
import { BasePage } from "@/components/layout/base-page";
import { PageHeader } from "@/components/page-header";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { PRODUCT_CATEGORIES } from "@repo/validators/products";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProductSelect } from "./_components/product-select";
import { productKeys } from "./hooks";
import * as mockStore from "./mock-store";
import { productFormSchema, type ProductFormValues } from "./schema";

export function ProductNewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: ProductFormValues) => {
    try {
      await mockStore.createProduct(values);
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produit créé avec succès");
      router.push("/showcase/products");
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  return (
    <BasePage
      breadcrumbs={[
        { title: "Showcase" },
        { title: "Produits", url: "/showcase/products" },
        { title: "Nouveau produit" },
      ]}
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <PageHeader
            title="Nouveau produit"
            variant="create"
            backNavigation={{ href: "/showcase/products", label: "Produits" }}
          />

          <FormSection title="Informations générales">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormTextField
                form={form}
                name="name"
                label="Nom"
                required
                placeholder="ex : Laptop Pro 15"
                disabled={isSubmitting}
              />
              <FormTextField
                form={form}
                name="reference"
                label="Référence"
                required
                placeholder="ex : ELEC-001"
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
                        placeholder="0.00"
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
                <FieldLabel htmlFor="stock">Stock initial *</FieldLabel>
                <Controller
                  control={form.control}
                  name="stock"
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        placeholder="0"
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
                placeholder="Décrivez le produit..."
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
            submitLabel="Créer le produit"
            submitLoadingLabel="Création..."
            onCancel={() => router.push("/showcase/products")}
          />
        </div>
      </form>
    </BasePage>
  );
}
