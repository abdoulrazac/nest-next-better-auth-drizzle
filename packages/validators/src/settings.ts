import { z } from "zod";

export const appSettingsSchema = z.object({
  appName: z.string().min(1).max(100),
  supportEmail: z.string().email(),
  maintenanceMode: z.boolean().default(false),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["fr", "en"]).default("fr"),
  timezone: z.string().default("Europe/Paris"),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
