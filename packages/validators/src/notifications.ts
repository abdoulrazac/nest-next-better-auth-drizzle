import { z } from "zod";
import {
  nonNegativeIntSchema,
  paginatedResponseSchema,
  uuidSchema,
} from "./shared.schema";

export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  inApp: z.boolean().default(true),
});

export const markAsReadSchema = z.object({
  ids: z.array(uuidSchema).min(1),
});

export const notificationResponseSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.unknown()).nullable(),
  read: z.boolean(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
});

export const notificationsPaginatedResponseSchema = paginatedResponseSchema(
  notificationResponseSchema,
);

export const unreadCountResponseSchema = z.object({
  total: nonNegativeIntSchema,
});

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
export type NotificationsPaginatedResponse = z.infer<
  typeof notificationsPaginatedResponseSchema
>;
export type NotificationUnreadCountResponse = z.infer<
  typeof unreadCountResponseSchema
>;
