import { z } from "zod";

export const createWebhookSchema = z.object({
  name: z.string().min(2).max(100),
  url: z.string().url("URL invalide"),
  events: z.array(z.string()).min(1, "Au moins un événement requis"),
  secret: z.string().min(16).optional(),
});

export const updateWebhookSchema = createWebhookSchema.partial();

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
