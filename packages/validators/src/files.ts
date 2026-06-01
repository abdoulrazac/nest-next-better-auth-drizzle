import { z } from "zod";
import {
  nonEmptyStringSchema,
  paginatedResponseSchema,
  paginationLimitSchema,
  paginationPageSchema,
  uuidSchema,
} from "./shared.schema";

// ── Upload constraints ────────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * Allowed MIME types for upload.
 * SVG is intentionally excluded — it can contain JavaScript and is a XSS vector.
 * Extend this list as your application requires.
 */
export const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // Documents
  "application/pdf",
  "text/plain",
  "text/csv",
  // Office (Open XML)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Office (legacy)
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const allowedMimeTypeSchema = z
  .string()
  .refine(
    (val): val is AllowedMimeType =>
      (ALLOWED_MIME_TYPES as readonly string[]).includes(val),
    { message: "File type is not allowed" },
  );

// ── Schemas ───────────────────────────────────────────────────────────────────

/**
 * Validates file metadata sent as JSON payload before/after upload.
 * For NestJS multipart uploads, use @UploadedFile() with custom pipe that maps
 * Express.Multer.File fields to this schema structure.
 */
export const uploadFileSchema = z.object({
  filename: z.string().min(1, "Le nom du fichier est requis"),
  mimeType: allowedMimeTypeSchema,
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, "Le fichier ne peut pas dépasser 100 Mo"),
});

export const fileQuerySchema = z.object({
  page: paginationPageSchema,
  limit: paginationLimitSchema,
  mimeType: z.string().optional(),
});

export const presignedUrlRequestSchema = z.object({
  originalName: nonEmptyStringSchema,
  mimeType: allowedMimeTypeSchema,
  /** Client-declared file size in bytes. Used to enforce the 100 MB cap before upload. */
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, "Le fichier ne peut pas dépasser 100 Mo"),
});

export const confirmUploadSchema = z.object({
  key: nonEmptyStringSchema,
  originalName: nonEmptyStringSchema,
  mimeType: allowedMimeTypeSchema,
  size: z.number().int().positive().max(MAX_FILE_SIZE),
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
