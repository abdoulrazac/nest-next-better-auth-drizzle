// apps/frontend/src/features/showcase/products/types.ts

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "OUT_OF_STOCK";
export type VariantStatus = "ACTIVE" | "INACTIVE";
export type ProductCategory =
  | "Électronique"
  | "Vêtements"
  | "Alimentation"
  | "Mobilier";

export interface Product {
  id: string;
  reference: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  description: string;
  similarProductId?: string;
  createdAt: string; // ISO string
}

export interface Variant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: VariantStatus;
}

export interface ProductFormValues {
  name: string;
  reference: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  description: string;
  similarProductId?: string;
}
