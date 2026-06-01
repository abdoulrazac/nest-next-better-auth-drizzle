// apps/backend/src/events/domain-events.ts
/**
 * Strongly-typed domain events.
 * Any module that needs to trigger side-effects (webhook delivery,
 * notifications, etc.) emits one of these instead of importing a
 * concrete delivery service.
 */

export const DomainEvent = {
  /** Emitted by any module that wants to fan out to registered webhooks. */
  WEBHOOK_DISPATCH: 'webhook.dispatch',
  /** Emitted by MessagesService after a message is successfully created. */
  MESSAGE_NEW: 'message.new',
} as const;

export type DomainEventKey = (typeof DomainEvent)[keyof typeof DomainEvent];

export interface WebhookDispatchEvent {
  event: string;
  payload: unknown;
}

export interface MessageNewEvent {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  conversationType: 'direct' | 'group';
  conversationName: string | null;
  /** All participant userIds except the sender */
  recipientIds: string[];
  /** Truncated preview for the notification body */
  preview: string;
}
