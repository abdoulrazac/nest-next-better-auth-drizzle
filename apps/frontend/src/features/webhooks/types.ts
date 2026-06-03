// Re-export from @repo/validators — single source of truth
export type {
  WebhookResponse as Webhook,
  WebhookDeliveryResponse as WebhookDelivery,
  WebhooksPaginatedResponse,
  WebhookDeliveriesPaginatedResponse,
  CreateWebhookInput,
  UpdateWebhookInput,
} from "@repo/validators/webhooks";
