# Global WebSocket Server Design

## Context

Currently, the WebSocket infrastructure lives inside `MessagingModule` via `MessagingGateway`. This couples the WS transport (auth, presence, heartbeat, room management) to the messaging domain, preventing other modules (notifications, etc.) from emitting real-time events.

**Goal**: Decouple the WebSocket infrastructure into a single global module that serves as infrastructure for any feature module (messaging, notifications, etc.) that needs real-time communication.

## Architecture

A single WebSocket server with a single gateway that is **domain-agnostic**. The gateway handles only cross-cutting concerns: authentication, presence, and heartbeat. Feature modules register their domain-specific handlers (join, leave, typing) via a registry pattern, and emit outgoing events via a shared `WebSocketService`.

```
src/websocket/
  websocket.gateway.ts        # Single gateway: auth + presence + dispatch
  websocket.service.ts        # Injectable: emitToUser, emitToRoom, broadcast
  ws-handler.registry.ts      # Registry for incoming event handlers
  presence.service.ts         # Redis presence (moved from messaging/)
  websocket.module.ts         # @Global()
  redis-io.adapter.ts         # Unchanged

src/modules/messaging/
  chat.handlers.ts            # Registers join, leave, typing, heartbeat handlers
  messaging.module.ts         # Imports WebSocketModule, removes MessagingGateway
  # presence/ deleted (moved to websocket/)
  # messaging.gateway.ts deleted

src/modules/notifications/
  notifications.handlers.ts   # Registers notifications:read, notifications:read-all
  notifications.service.ts    # Emits notification:new via WebSocketService
```

## Section 1: WebSocket Global Module

### ws-handler.registry.ts

A registry that maps event names to handler functions. Feature modules register their handlers at bootstrap time via `OnModuleInit`. The gateway looks up handlers by event name when a message arrives.

```typescript
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
```

### websocket.gateway.ts

The gateway is **domain-agnostic**. It handles only auth, presence, heartbeat, and dispatches incoming messages to registered handlers via `socket.onAny`. No `@SubscribeMessage` decorators — all handlers are registered dynamically.

```typescript
@WebSocketGateway(env.WS_PORT, {
  cors: { origin: env.CORS_ORIGINS, credentials: true },
  transports: ["websocket", "polling"],
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly presenceService: PresenceService,
    private readonly registry: WsHandlerRegistry,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    const token =
      (socket.handshake.auth as Record<string, string>)?.token ??
      socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");

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
      this.server.emit("presence:online", { userId: session.user.id });
    } catch {
      socket.disconnect(true);
    }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const userId = socket.data.userId as string | undefined;
    if (userId) {
      await this.presenceService.setOffline(userId);
      this.server.emit("presence:offline", { userId });
    }
  }
}
```

Incoming message dispatch is wired in `handleConnection` via `socket.onAny`:

```typescript
socket.onAny((event: string, data: unknown) => {
  const handler = this.registry.getHandler(event);
  if (handler) void handler(socket, data);
});
```

### websocket.service.ts

```typescript
@Injectable()
export class WebSocketService {
  @WebSocketServer() server: Server;

  emitToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToRoom(room: string, event: string, data: unknown): void {
    this.server.to(room).emit(event, data);
  }

  broadcast(event: string, data: unknown): void {
    this.server.emit(event, data);
  }
}
```

### websocket.module.ts

```typescript
@Global()
@Module({
  imports: [RedisModule],
  providers: [
    WebSocketGateway,
    WebSocketService,
    WsHandlerRegistry,
    PresenceService,
  ],
  exports: [WebSocketService, WsHandlerRegistry, PresenceService],
})
export class WebSocketModule {}
```

### app.module.ts changes

- Add `WebSocketModule` to global imports.

## Section 2: Messaging Module Refactored

### chat.handlers.ts

An `@Injectable()` class that registers its handlers with the registry at bootstrap via `OnModuleInit`. No gateway class — the global gateway dispatches to these handlers automatically.

```typescript
@Injectable()
export class ChatHandlers implements OnModuleInit {
  constructor(
    private readonly registry: WsHandlerRegistry,
    private readonly webSocketService: WebSocketService,
    private readonly presenceService: PresenceService,
  ) {}

  onModuleInit(): void {
    this.registry.register("join", this.handleJoin.bind(this));
    this.registry.register("leave", this.handleLeave.bind(this));
    this.registry.register("typing", this.handleTyping.bind(this));
    this.registry.register("heartbeat", this.handleHeartbeat.bind(this));
  }

  private handleJoin(socket: Socket, conversationId: unknown): void {
    if (typeof conversationId !== "string") return;
    void socket.join(`conv:${conversationId}`);
  }

  private handleLeave(socket: Socket, conversationId: unknown): void {
    if (typeof conversationId !== "string") return;
    void socket.leave(`conv:${conversationId}`);
  }

  private handleTyping(socket: Socket, payload: unknown): void {
    const data = payload as { conversationId: string; isTyping: boolean };
    this.webSocketService.emitToRoom(`conv:${data.conversationId}`, "typing", {
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
```

### messaging.module.ts

```typescript
@Module({
  imports: [FilesModule, WebSocketModule],
  controllers: [
    ConversationsController,
    MessagesController,
    ReactionsController,
  ],
  providers: [
    ConversationsService,
    ConversationsRepository,
    MessagesService,
    MessagesRepository,
    ReactionsService,
    ReactionsRepository,
    ChatHandlers,
  ],
  exports: [ConversationsService, MessagesService],
})
export class MessagingModule {}
```

### messages.controller.ts

Replaces `MessagingGateway` injection with `WebSocketService`:

```typescript
constructor(
  private readonly messagesService: MessagesService,
  private readonly webSocketService: WebSocketService,
) {}

// Before: this.gateway.emitToConversation(id, 'message:new', message)
// After:
this.webSocketService.emitToRoom(`conv:${id}`, 'message:new', message);
```

## Section 3: Notifications Module with WebSocket

### notifications.handlers.ts

```typescript
@Injectable()
export class NotificationsHandlers implements OnModuleInit {
  constructor(
    private readonly registry: WsHandlerRegistry,
    private readonly notificationsService: NotificationsService,
    private readonly webSocketService: WebSocketService,
  ) {}

  onModuleInit(): void {
    this.registry.register(
      "notifications:read",
      this.handleMarkAsRead.bind(this),
    );
    this.registry.register(
      "notifications:read-all",
      this.handleMarkAllAsRead.bind(this),
    );
  }

  private async handleMarkAsRead(socket: Socket, data: unknown): Promise<void> {
    const userId = socket.data.userId as string;
    const { ids } = data as { ids: string[] };
    const updated = await this.notificationsService.markAsRead(userId, { ids });
    this.webSocketService.emitToUser(userId, "notifications:updated", updated);
  }

  private async handleMarkAllAsRead(socket: Socket): Promise<void> {
    const userId = socket.data.userId as string;
    const updated = await this.notificationsService.markAllAsRead(userId);
    this.webSocketService.emitToUser(userId, "notifications:updated", updated);
  }
}
```

### notifications.service.ts

Injects `WebSocketService` and emits real-time notifications on `MESSAGE_NEW`:

```typescript
constructor(
  private readonly notificationsRepository: NotificationsRepository,
  private readonly webSocketService: WebSocketService,
) {}

@OnEvent(DomainEvent.MESSAGE_NEW)
async handleNewMessage(event: MessageNewEvent): Promise<void> {
  // ... existing notification creation ...

  for (const userId of event.recipientIds) {
    this.webSocketService.emitToUser(userId, 'notification:new', {
      type: 'new_message',
      title,
      body: event.preview,
      data: { conversationId: event.conversationId, messageId: event.messageId },
    });
  }
}
```

### notifications.module.ts

```typescript
@Module({
  imports: [WebSocketModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationsHandlers,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

## Event Naming Convention

All WebSocket events use a `domain:action` pattern to avoid collisions across modules:

| Event                    | Direction                      | Emitted by            |
| ------------------------ | ------------------------------ | --------------------- |
| `presence:online`        | server → all                   | Gateway               |
| `presence:offline`       | server → all                   | Gateway               |
| `join`                   | client → server                | ChatHandlers          |
| `leave`                  | client → server                | ChatHandlers          |
| `typing`                 | client → server, server → room | ChatHandlers          |
| `heartbeat`              | client → server                | ChatHandlers          |
| `message:new`            | server → room                  | MessagesController    |
| `message:updated`        | server → room                  | MessagesController    |
| `message:deleted`        | server → room                  | MessagesController    |
| `notification:new`       | server → user                  | NotificationsService  |
| `notifications:updated`  | server → user                  | NotificationsHandlers |
| `notifications:read`     | client → server                | NotificationsHandlers |
| `notifications:read-all` | client → server                | NotificationsHandlers |

## Client Connection

Clients connect to a single namespace (root `/`):

```typescript
const socket = io("/", { auth: { token } });
```

All events (presence, messaging, notifications) flow over the same connection, distinguished by event name.

## Migration Notes

- `MessagingGateway` is deleted; its auth/presence logic moves to `WebSocketGateway`, its domain handlers move to `ChatHandlers`.
- `presence/presence.service.ts` is moved to `websocket/presence.service.ts`.
- No changes to REST controllers or services beyond the gateway injection swap.
- `redis-io.adapter.ts` remains unchanged.
- Existing client code that connects to `/chat` namespace must be updated to connect to root `/`.
