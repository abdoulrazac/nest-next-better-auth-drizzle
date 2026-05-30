import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ email: true });

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  permissions: z.array(z.string()).min(1, "Au moins une permission requise"),
});

export const updateRoleSchema = createRoleSchema
  .partial()
  .refine((data) => !data.permissions || data.permissions.length > 0, {
    message: "permissions ne peut pas être vide",
    path: ["permissions"],
  });

export const auditLogQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
