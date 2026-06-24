// apps/backend/src/websocket/websocket.gateway.ts
import { auth } from '@/auth/auth';
import { env } from '@/config/env';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway as Gateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import { WebSocketService } from './websocket.service';
import { WsHandlerRegistry } from './ws-handler.registry';

@Gateway(env.WS_PORT, {
  cors: { origin: env.CORS_ORIGINS, credentials: true },
  transports: ['websocket', 'polling'],
})
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

      await socket.join(`user:${session.user.id}`);
      await this.presenceService.setOnline(session.user.id);
      this.server.emit('presence:online', { userId: session.user.id });

      socket.onAny((event: string, data: unknown) => {
        const handler = this.registry.getHandler(event);
        if (handler) void handler(socket, data);
      });
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
}
