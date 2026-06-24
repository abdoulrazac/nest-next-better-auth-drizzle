// apps/backend/src/websocket/websocket.service.ts
import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class WebSocketService {
  private server?: Server;

  setServer(server: Server): void {
    this.server = server;
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.server?.to(`user:${userId}`).emit(event, data);
  }

  emitToRoom(room: string, event: string, data: unknown): void {
    this.server?.to(room).emit(event, data);
  }

  broadcast(event: string, data: unknown): void {
    this.server?.emit(event, data);
  }
}
