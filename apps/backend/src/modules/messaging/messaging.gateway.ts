// apps/backend/src/modules/messaging/messaging.gateway.ts
import { auth } from '@/auth/auth';
import { env } from '@/config/env';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PresenceService } from './presence/presence.service';

@WebSocketGateway(env.WS_PORT, {
  namespace: '/chat',
  // Use the same origin allow-list as the HTTP layer — never wildcard with credentials
  cors: { origin: env.CORS_ORIGINS, credentials: true },
  transports: ['websocket', 'polling'],
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly presenceService: PresenceService) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  async handleConnection(socket: Socket): Promise<void> {
    const token =
      (socket.handshake.auth as Record<string, string>)?.token ??
      socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      socket.disconnect(true);
      return;
    }

    try {
      const session = await auth.api.getSession({
        headers: new Headers({ authorization: `Bearer ${token}` }),
      });

      if (!session) {
        socket.disconnect(true);
        return;
      }

      socket.data.userId = session.user.id;
      socket.data.userName = session.user.name;

      // Personal room for targeted notifications
      await socket.join(`user:${session.user.id}`);
      await this.presenceService.setOnline(session.user.id);
      this.server.emit('presence:online', { userId: session.user.id });
    } catch {
      socket.disconnect(true);
    }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const userId = socket.data.userId as string | undefined;
    if (userId) {
      await this.presenceService.setOffline(userId);
      this.server.emit('presence:offline', { userId });
    }
  }

  // ─── Room management ──────────────────────────────────────────────────────

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() conversationId: string,
  ) {
    void socket.join(`conv:${conversationId}`);
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() conversationId: string,
  ) {
    void socket.leave(`conv:${conversationId}`);
  }

  // ─── Typing indicator ─────────────────────────────────────────────────────

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { conversationId: string; isTyping: boolean },
  ) {
    socket.to(`conv:${payload.conversationId}`).emit('typing', {
      userId: socket.data.userId as string,
      userName: socket.data.userName as string,
      isTyping: payload.isTyping,
    });
  }

  // ─── Heartbeat ────────────────────────────────────────────────────────────

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() socket: Socket): Promise<void> {
    const userId = socket.data.userId as string | undefined;
    if (userId) {
      await this.presenceService.refreshTtl(userId);
    }
  }

  // ─── Emission helpers (called by controllers) ─────────────────────────────

  emitToConversation(
    conversationId: string,
    event: string,
    data: unknown,
  ): void {
    this.server.to(`conv:${conversationId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
