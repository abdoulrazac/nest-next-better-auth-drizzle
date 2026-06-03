import { z } from "zod";

export const appSettingsFormSchema = z.object({
  appName: z.string().min(1, "Le nom est requis").max(100),
  supportEmail: z.string().email("Email invalide"),
  maintenanceMode: z.boolean(),
});

export const preferencesFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["fr", "en"]),
  timezone: z.string().min(1, "Le fuseau horaire est requis"),
});

export type AppSettingsFormValues = z.infer<typeof appSettingsFormSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;
