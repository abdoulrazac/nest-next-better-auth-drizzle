import { z } from "zod";

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
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  mimeType: z.string().optional(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type FileQuery = z.infer<typeof fileQuerySchema>;
