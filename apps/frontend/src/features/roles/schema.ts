import { z } from "zod";

export const createRoleSchema = z.object({
  role: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  permission: z.record(z.string(), z.array(z.string())).optional(),
});

export type RoleFormValues = z.infer<typeof createRoleSchema>;
