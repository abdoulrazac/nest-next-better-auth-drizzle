// apps/backend/src/modules/notifications/notifications.service.ts
import { DomainEvent, type MessageNewEvent } from '@/events/domain-events';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  notificationResponseSchema,
  notificationsPaginatedResponseSchema,
  unreadCountResponseSchema,
  type MarkAsReadInput,
  type NotificationResponse,
  type NotificationsPaginatedResponse,
  type NotificationUnreadCountResponse,
} from '@repo/validators/notifications';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async findAll(
    userId: string,
    page: number,
    limit: number,
  ): Promise<NotificationsPaginatedResponse> {
    const notifications = await this.notificationsRepository.findAllForUser(
      userId,
      page,
      limit,
    );
    return notificationsPaginatedResponseSchema.parse(notifications);
  }

  async countUnread(userId: string): Promise<NotificationUnreadCountResponse> {
    const unread = await this.notificationsRepository.countUnread(userId);
    return unreadCountResponseSchema.parse(unread);
  }

  async markAsRead(
    userId: string,
    input: MarkAsReadInput,
  ): Promise<NotificationResponse[]> {
    const updated = await this.notificationsRepository.markAsRead(
      userId,
      input.ids,
    );
    return notificationResponseSchema.array().parse(updated);
  }

  async markAllAsRead(userId: string): Promise<NotificationResponse[]> {
    const updated = await this.notificationsRepository.markAllAsRead(userId);
    return notificationResponseSchema.array().parse(updated);
  }

  async delete(userId: string, id: string): Promise<NotificationResponse> {
    const deleted = await this.notificationsRepository.delete(userId, id);
    if (!deleted) throw new NotFoundException(`Notification ${id} not found`);
    return notificationResponseSchema.parse(deleted);
  }

  @OnEvent(DomainEvent.MESSAGE_NEW)
  async handleNewMessage(event: MessageNewEvent): Promise<void> {
    const title =
      event.conversationType === 'group'
        ? `${event.senderName} dans ${event.conversationName ?? 'le groupe'}`
        : event.senderName;

    await Promise.all(
      event.recipientIds.map((userId) =>
        this.notificationsRepository.create({
          userId,
          type: 'new_message',
          title,
          body: event.preview,
          data: {
            conversationId: event.conversationId,
            messageId: event.messageId,
            senderId: event.senderId,
          },
        }),
      ),
    );
  }
}
