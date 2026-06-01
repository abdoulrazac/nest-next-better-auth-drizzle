import { z } from "zod";
import { uuidSchema } from "./shared.schema";

export const appSettingsSchema = z.object({
  appName: z.string().min(1).max(100),
  supportEmail: z.string().email(),
  maintenanceMode: z.boolean().default(false),
});

export const updateAppSettingsSchema = appSettingsSchema.partial();

export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["fr", "en"]).default("fr"),
  timezone: z.string().default("Europe/Paris"),
});

export const updateUserPreferencesSchema = userPreferencesSchema.partial();

export const appSettingsResponseSchema = appSettingsSchema;

export const userPreferencesResponseSchema = z.object({
  id: uuidSchema.optional(),
  userId: z.string().min(1),
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["fr", "en"]),
  timezone: z.string(),
  updatedAt: z.date().optional(),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;
export type UpdateAppSettings = z.infer<typeof updateAppSettingsSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
export type AppSettingsResponse = z.infer<typeof appSettingsResponseSchema>;
export type UserPreferencesResponse = z.infer<
  typeof userPreferencesResponseSchema
>;
