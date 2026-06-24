// apps/backend/src/websocket/websocket.gateway.ts
import { env } from '@/config/env';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway as Gateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, type UserSession } from '@thallesp/nestjs-better-auth';
import type { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import { WebSocketService } from './websocket.service';
import { WsHandlerRegistry } from './ws-handler.registry';

declare module 'socket.io' {
  interface Socket {
    session?: UserSession;
    user?: UserSession['user'] | null;
  }
}

@Gateway(env.WS_PORT, {
  cors: { origin: env.CORS_ORIGINS, credentials: true },
  transports: ['websocket', 'polling'],
})
@UseGuards(AuthGuard)
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly presenceService: PresenceService,
    private readonly registry: WsHandlerRegistry,
    private readonly webSocketService: WebSocketService,
  ) {}

  afterInit(): void {
    this.webSocketService.setServer(this.server);
  }

  async handleConnection(socket: Socket): Promise<void> {
    const session = socket.session;
    if (!session) {
      socket.disconnect(true);
      return;
    }

    const userId = session.user.id;
    const userName = session.user.name;

    socket.data.userId = userId;
    socket.data.userName = userName;

    await socket.join(`user:${userId}`);
    await this.presenceService.setOnline(userId);
    this.server.emit('presence:online', { userId });

    socket.onAny((event: string, data: unknown) => {
      const handler = this.registry.getHandler(event);
      if (handler) void handler(socket, data);
    });
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const userId = socket.data.userId as string | undefined;
    if (userId) {
      await this.presenceService.setOffline(userId);
      this.server.emit('presence:offline', { userId });
    }
  }
}
