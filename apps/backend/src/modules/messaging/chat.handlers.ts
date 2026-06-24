// apps/backend/src/modules/messaging/chat.handlers.ts
import { PresenceService } from '@/websocket/presence.service';
import { WsHandlerRegistry } from '@/websocket/ws-handler.registry';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConversationsRepository } from './conversations/conversations.repository';
import type { Socket } from 'socket.io';

@Injectable()
export class ChatHandlers implements OnModuleInit {
  constructor(
    private readonly registry: WsHandlerRegistry,
    private readonly presenceService: PresenceService,
    private readonly conversationsRepo: ConversationsRepository,
  ) {}

  onModuleInit(): void {
    this.registry.register('join', this.handleJoin.bind(this));
    this.registry.register('leave', this.handleLeave.bind(this));
    this.registry.register('typing', this.handleTyping.bind(this));
    this.registry.register('heartbeat', this.handleHeartbeat.bind(this));
  }

  private async handleJoin(
    socket: Socket,
    conversationId: unknown,
  ): Promise<void> {
    if (typeof conversationId !== 'string') return;
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;

    // Verify the user is a participant of the conversation before joining the
    // room. Without this check, any authenticated user could join any
    // conversation's room and receive real-time message events (IDOR).
    const isParticipant = await this.conversationsRepo.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant) return;

    void socket.join(`conv:${conversationId}`);
  }

  private handleLeave(socket: Socket, conversationId: unknown): void {
    if (typeof conversationId !== 'string') return;
    void socket.leave(`conv:${conversationId}`);
  }

  private async handleTyping(socket: Socket, payload: unknown): Promise<void> {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof (payload as Record<string, unknown>).conversationId !== 'string' ||
      typeof (payload as Record<string, unknown>).isTyping !== 'boolean'
    ) {
      return;
    }
    const data = payload as { conversationId: string; isTyping: boolean };
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;

    // Only emit typing events if the user is actually a participant.
    const isParticipant = await this.conversationsRepo.isParticipant(
      data.conversationId,
      userId,
    );
    if (!isParticipant) return;

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
