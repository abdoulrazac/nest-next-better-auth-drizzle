import { z } from "zod";

export const emailSchema = z.string().email("Email invalide");

export const nameMin2Schema = z
  .string()
  .min(2, "Le nom doit contenir au moins 2 caractères");

export const passwordMin8Schema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères");

export const passwordComplexSchema = passwordMin8Schema
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre");

export const nonEmptyStringSchema = z.string().min(1);
export const uuidSchema = z.string().uuid();

export const paginationPageSchema = z.coerce
  .number()
  .int()
  .positive()
  .default(1);

export const paginationLimitSchema = z.coerce
  .number()
  .int()
  .positive()
  .max(100)
  .default(20);

export const paginationQuerySchema = z.object({
  page: paginationPageSchema,
  limit: paginationLimitSchema,
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const nonNegativeIntSchema = z.number().int().nonnegative();

export const paginatedResponseSchema = <TSchema extends z.ZodTypeAny>(
  itemSchema: TSchema,
) =>
  z.object({
    items: z.array(itemSchema),
    total: nonNegativeIntSchema,
    page: paginationPageSchema,
    limit: paginationLimitSchema,
  });

export const fileAttachmentTypeSchema = z
  .enum(["file", "image", "voice"])
  .default("file");

export const successResponseSchema = z.object({
  success: z.literal(true),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
