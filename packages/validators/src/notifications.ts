import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  inApp: z.boolean().default(true),
});

export const markAsReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
