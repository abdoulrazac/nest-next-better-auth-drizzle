// apps/frontend/src/features/showcase/products/mock-store.ts
import { INITIAL_PRODUCTS, INITIAL_VARIANTS } from "./mock-data";
import type { Product, Variant, ProductFormValues } from "./types";

// Variables mutables — reset au rechargement
let _products: Product[] = [...INITIAL_PRODUCTS];
let _variants: Variant[] = [...INITIAL_VARIANTS];

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Products ──────────────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  return _products;
}

export function getProductById(id: string): Product | undefined {
  return _products.find((p) => p.id === id);
}

export async function createProduct(
  values: ProductFormValues,
): Promise<Product> {
  await delay();
  const product: Product = {
    ...values,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  _products = [product, ..._products];
  return product;
}

export async function updateProduct(
  id: string,
  values: Partial<ProductFormValues>,
): Promise<Product> {
  await delay();
  const idx = _products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Produit ${id} introuvable`);
  const updated = { ..._products[idx], ...values };
  _products = _products.map((p) => (p.id === id ? updated : p));
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  await delay();
  _products = _products.filter((p) => p.id !== id);
  _variants = _variants.filter((v) => v.productId !== id);
}

// ── Variants ──────────────────────────────────────────────────────────────────

export function getVariantsByProductId(productId: string): Variant[] {
  return _variants.filter((v) => v.productId === productId);
}
