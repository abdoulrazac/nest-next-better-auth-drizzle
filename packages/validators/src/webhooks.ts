import { z } from "zod";

export const createWebhookSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  url: z.string().url("URL invalide"),
  events: z.array(z.string()).min(1, "Au moins un événement requis"),
  secret: z
    .string()
    .min(16, "Le secret doit contenir au moins 16 caractères")
    .optional(),
});

export const updateWebhookSchema = createWebhookSchema
  .partial()
  .refine((data) => !data.events || data.events.length > 0, {
    message: "events ne peut pas être vide",
    path: ["events"],
  });

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
