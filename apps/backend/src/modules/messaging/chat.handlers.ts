// apps/backend/src/modules/messaging/chat.handlers.ts
import { PresenceService } from '@/websocket/presence.service';
import { WsHandlerRegistry } from '@/websocket/ws-handler.registry';
import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Socket } from 'socket.io';

@Injectable()
export class ChatHandlers implements OnModuleInit {
  constructor(
    private readonly registry: WsHandlerRegistry,
    private readonly presenceService: PresenceService,
  ) {}

  onModuleInit(): void {
    this.registry.register('join', this.handleJoin.bind(this));
    this.registry.register('leave', this.handleLeave.bind(this));
    this.registry.register('typing', this.handleTyping.bind(this));
    this.registry.register('heartbeat', this.handleHeartbeat.bind(this));
  }

  private handleJoin(socket: Socket, conversationId: unknown): void {
    if (typeof conversationId !== 'string') return;
    void socket.join(`conv:${conversationId}`);
  }

  private handleLeave(socket: Socket, conversationId: unknown): void {
    if (typeof conversationId !== 'string') return;
    void socket.leave(`conv:${conversationId}`);
  }

  private handleTyping(socket: Socket, payload: unknown): void {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof (payload as Record<string, unknown>).conversationId !== 'string' ||
      typeof (payload as Record<string, unknown>).isTyping !== 'boolean'
    ) {
      return;
    }
    const data = payload as { conversationId: string; isTyping: boolean };
    socket.to(`conv:${data.conversationId}`).emit('typing', {
      userId: socket.data.userId,
      userName: socket.data.userName,
      isTyping: data.isTyping,
    });
  }

  private async handleHeartbeat(socket: Socket): Promise<void> {
    const userId = socket.data.userId as string | undefined;
    if (userId) await this.presenceService.refreshTtl(userId);
  }
}
