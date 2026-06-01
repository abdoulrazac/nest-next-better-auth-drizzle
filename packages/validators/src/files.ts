import { z } from "zod";
import {
  nonEmptyStringSchema,
  paginatedResponseSchema,
  paginationLimitSchema,
  paginationPageSchema,
  uuidSchema,
} from "./shared.schema";

/**
 * Validates file metadata sent as JSON payload before/after upload.
 * For NestJS multipart uploads, use @UploadedFile() with custom pipe that maps
 * Express.Multer.File fields to this schema structure.
 */
export const uploadFileSchema = z.object({
  filename: z.string().min(1, "Le nom du fichier est requis"),
  mimeType: z.string().min(1, "Le type MIME est requis"),
  size: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024, "Le fichier ne peut pas dépasser 100 Mo"),
});

export const fileQuerySchema = z.object({
  page: paginationPageSchema,
  limit: paginationLimitSchema,
  mimeType: z.string().optional(),
});

export const presignedUrlRequestSchema = z.object({
  originalName: nonEmptyStringSchema,
  mimeType: nonEmptyStringSchema,
});

export const confirmUploadSchema = z.object({
  key: nonEmptyStringSchema,
  originalName: nonEmptyStringSchema,
  mimeType: nonEmptyStringSchema,
  size: z.number().int().positive(),
});

export const fileResponseSchema = z.object({
  id: uuidSchema,
  filename: nonEmptyStringSchema,
  originalName: nonEmptyStringSchema,
  mimeType: nonEmptyStringSchema,
  size: z.number().int().nonnegative(),
  bucket: nonEmptyStringSchema,
  key: nonEmptyStringSchema,
  url: z.string().url(),
  uploadedBy: z.string().min(1).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const filesPaginatedResponseSchema =
  paginatedResponseSchema(fileResponseSchema);

export const presignedUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  key: nonEmptyStringSchema,
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type FileQuery = z.infer<typeof fileQuerySchema>;
export type PresignedUrlRequest = z.infer<typeof presignedUrlRequestSchema>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
export type FileResponse = z.infer<typeof fileResponseSchema>;
export type FilesPaginatedResponse = z.infer<
  typeof filesPaginatedResponseSchema
>;
export type PresignedUrlResponse = z.infer<typeof presignedUrlResponseSchema>;
