import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ email: true });

export const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  permissions: z.array(z.string()).min(1),
});

export const updateRoleSchema = createRoleSchema.partial();

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
