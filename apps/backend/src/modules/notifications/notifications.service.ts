// apps/backend/src/modules/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import type { MarkAsReadInput } from '@repo/validators/notifications';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  findAll(userId: string, page: number, limit: number) {
    return this.notificationsRepository.findAllForUser(userId, page, limit);
  }

  countUnread(userId: string) {
    return this.notificationsRepository.countUnread(userId);
  }

  markAsRead(userId: string, input: MarkAsReadInput) {
    return this.notificationsRepository.markAsRead(userId, input.ids);
  }

  markAllAsRead(userId: string) {
    return this.notificationsRepository.markAllAsRead(userId);
  }

  async delete(userId: string, id: string) {
    const deleted = await this.notificationsRepository.delete(userId, id);
    if (!deleted) throw new NotFoundException(`Notification ${id} not found`);
    return deleted;
  }
}
