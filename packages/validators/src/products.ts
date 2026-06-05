import { z } from "zod";
import { uuidSchema } from "./shared.schema";

export const PRODUCT_CATEGORIES = [
  "Électronique",
  "Vêtements",
  "Alimentation",
  "Mobilier",
] as const;

export const PRODUCT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "DRAFT",
  "OUT_OF_STOCK",
] as const;

export const createProductInputSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  reference: z
    .string()
    .min(2, "La référence doit contenir au moins 2 caractères"),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.coerce.number().positive("Le prix doit être positif"),
  stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif"),
  status: z.enum(PRODUCT_STATUSES),
  description: z.string().optional().default(""),
  similarProductId: uuidSchema.optional(),
});

export const updateProductInputSchema = createProductInputSchema.partial();

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type CreateProductInput = z.infer<typeof createProductInputSchema>;
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
