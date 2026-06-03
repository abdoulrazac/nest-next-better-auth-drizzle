// apps/frontend/src/features/showcase/products/new-page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BasePage } from "@/components/layout/base-page";
import { PageHeader, PageHeaderActions } from "@/components/page-header";
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

export function ProductNewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
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

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await mockStore.createProduct(values);
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produit créé avec succès");
      router.push("/showcase/products");
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <PageHeader
            title="Nouveau produit"
            variant="create"
            backNavigation={{ href: "/showcase/products", label: "Produits" }}
            primaryAction={PageHeaderActions.save(
              handleSubmit(onSubmit),
              isSubmitting,
            )}
            secondaryActions={[PageHeaderActions.cancel("/showcase/products")]}
          />

          <FormSection title="Informations générales">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  placeholder="ex : Laptop Pro 15"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference">Référence *</Label>
                <Input
                  id="reference"
                  placeholder="ex : ELEC-001"
                  {...register("reference")}
                />
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
                      placeholder="Sélectionner un statut"
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
                  placeholder="0.00"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock initial *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
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
                  placeholder="Décrivez le produit..."
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
