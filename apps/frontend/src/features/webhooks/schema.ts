// Re-export schemas from @repo/validators — single source of truth
export {
  createWebhookSchema,
  updateWebhookSchema,
} from "@repo/validators/webhooks";
export type { CreateWebhookInput as WebhookFormValues } from "@repo/validators/webhooks";

// Available webhook events (UI-only constant)
export const AVAILABLE_EVENTS = [
  "user.created",
  "user.updated",
  "user.deleted",
  "role.created",
  "role.updated",
  "file.uploaded",
  "file.deleted",
];
