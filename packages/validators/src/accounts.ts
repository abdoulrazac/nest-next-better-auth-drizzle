import { z } from "zod";
import {
  emailSchema,
  nameMin2Schema,
  paginatedResponseSchema,
  paginationLimitSchema,
  paginationPageSchema,
  uuidSchema,
} from "./shared.schema";

export const userSearchPaginationQuerySchema = z.object({
  page: paginationPageSchema,
  limit: paginationLimitSchema,
  search: z.string().optional(),
});

export const createUserSchema = z.object({
  name: nameMin2Schema,
  email: emailSchema,
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ email: true });

export const banUserSchema = z.object({
  reason: z.string().min(1).max(500).optional(),
});

export const createRoleSchema = z.object({
  name: nameMin2Schema.max(50, "Le nom ne peut pas dépasser 50 caractères"),
  permissions: z.array(z.string()).min(1, "Au moins une permission requise"),
});

export const updateRoleSchema = createRoleSchema
  .partial()
  .refine((data) => !data.permissions || data.permissions.length > 0, {
    message: "permissions ne peut pas être vide",
    path: ["permissions"],
  });

export const auditLogQuerySchema = z.object({
  userId: uuidSchema.optional(),
  action: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: paginationPageSchema,
  limit: paginationLimitSchema,
});

export const userResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: emailSchema,
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  role: z.string().min(1),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  banExpires: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const roleResponseSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1),
  permissions: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userRoleResponseSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1),
  roleId: uuidSchema,
  createdAt: z.date(),
});

export const auditLogResponseSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1).nullable(),
  action: z.string().min(1),
  resource: z.string().min(1),
  resourceId: z.string().nullable(),
  metadata: z.unknown().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date(),
});

export const usersPaginatedResponseSchema =
  paginatedResponseSchema(userResponseSchema);

export const rolesPaginatedResponseSchema =
  paginatedResponseSchema(roleResponseSchema);

export const auditLogsPaginatedResponseSchema = paginatedResponseSchema(
  auditLogResponseSchema,
);

export type CreateAuditLogInput = {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

export type UserSearchPaginationQuery = z.infer<
  typeof userSearchPaginationQuerySchema
>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type RoleResponse = z.infer<typeof roleResponseSchema>;
export type UserRoleResponse = z.infer<typeof userRoleResponseSchema>;
export type AuditLogResponse = z.infer<typeof auditLogResponseSchema>;
export type UsersPaginatedResponse = z.infer<
  typeof usersPaginatedResponseSchema
>;
export type RolesPaginatedResponse = z.infer<
  typeof rolesPaginatedResponseSchema
>;
export type AuditLogsPaginatedResponse = z.infer<
  typeof auditLogsPaginatedResponseSchema
>;
