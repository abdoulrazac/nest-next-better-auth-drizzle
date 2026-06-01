import { z } from "zod";
import {
  nameMin2Schema,
  nonEmptyStringSchema,
  paginatedResponseSchema,
  uuidSchema,
} from "./shared.schema";

export const createWebhookSchema = z.object({
  name: nameMin2Schema.max(100, "Le nom ne peut pas dépasser 100 caractères"),
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

export const webhookResponseSchema = z.object({
  id: uuidSchema,
  name: nonEmptyStringSchema,
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().nullable(),
  active: z.boolean(),
  createdBy: z.string().min(1).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const webhookDeliveryResponseSchema = z.object({
  id: uuidSchema,
  webhookId: uuidSchema,
  event: nonEmptyStringSchema,
  payload: z.record(z.unknown()),
  statusCode: z.number().int().nullable(),
  response: z.string().nullable(),
  success: z.boolean(),
  createdAt: z.date(),
});

export const webhooksPaginatedResponseSchema = paginatedResponseSchema(
  webhookResponseSchema,
);

export const webhookDeliveriesPaginatedResponseSchema = paginatedResponseSchema(
  webhookDeliveryResponseSchema,
);

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
export type WebhookResponse = z.infer<typeof webhookResponseSchema>;
export type WebhookDeliveryResponse = z.infer<
  typeof webhookDeliveryResponseSchema
>;
export type WebhooksPaginatedResponse = z.infer<
  typeof webhooksPaginatedResponseSchema
>;
export type WebhookDeliveriesPaginatedResponse = z.infer<
  typeof webhookDeliveriesPaginatedResponseSchema
>;
