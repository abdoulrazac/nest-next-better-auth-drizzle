// apps/backend/src/modules/notifications/notifications.handlers.ts
import { WebSocketService } from '@/websocket/websocket.service';
import { WsHandlerRegistry } from '@/websocket/ws-handler.registry';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { markAsReadSchema } from '@repo/validators/notifications';
import type { Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsHandlers implements OnModuleInit {
  constructor(
    private readonly registry: WsHandlerRegistry,
    private readonly notificationsService: NotificationsService,
    private readonly webSocketService: WebSocketService,
  ) {}

  onModuleInit(): void {
    this.registry.register(
      'notifications:read',
      this.handleMarkAsRead.bind(this),
    );
    this.registry.register(
      'notifications:read-all',
      this.handleMarkAllAsRead.bind(this),
    );
  }

  private async handleMarkAsRead(socket: Socket, data: unknown): Promise<void> {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;
    const parsed = markAsReadSchema.safeParse(data);
    if (!parsed.success) return;
    const updated = await this.notificationsService.markAsRead(
      userId,
      parsed.data,
    );
    this.webSocketService.emitToUser(userId, 'notifications:updated', updated);
  }

  private async handleMarkAllAsRead(socket: Socket): Promise<void> {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;
    const updated = await this.notificationsService.markAllAsRead(userId);
    this.webSocketService.emitToUser(userId, 'notifications:updated', updated);
  }
}
