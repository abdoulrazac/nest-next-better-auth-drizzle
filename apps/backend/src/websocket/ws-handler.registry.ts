import { Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';

export type WsHandler = (socket: Socket, data: unknown) => void | Promise<void>;

@Injectable()
export class WsHandlerRegistry {
  private readonly handlers = new Map<string, WsHandler>();

  register(event: string, handler: WsHandler): void {
    if (this.handlers.has(event)) {
      throw new Error(`Handler already registered for event: ${event}`);
    }
    this.handlers.set(event, handler);
  }

  getHandler(event: string): WsHandler | undefined {
    return this.handlers.get(event);
  }
}
