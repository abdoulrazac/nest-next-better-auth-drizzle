// apps/frontend/src/features/showcase/products/schema.ts
import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  reference: z
    .string()
    .min(2, "La référence doit contenir au moins 2 caractères"),
  category: z.enum(["Électronique", "Vêtements", "Alimentation", "Mobilier"], {
    required_error: "Sélectionnez une catégorie",
  }),
  price: z.coerce.number().positive("Le prix doit être positif"),
  stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif"),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT", "OUT_OF_STOCK"], {
    required_error: "Sélectionnez un statut",
  }),
  description: z.string().optional().default(""),
  similarProductId: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
