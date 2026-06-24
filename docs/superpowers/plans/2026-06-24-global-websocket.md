# Global WebSocket Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the WebSocket infrastructure into a single global module with a domain-agnostic gateway, a registry pattern for incoming handlers, and a shared emission service, so any feature module (messaging, notifications, etc.) can use real-time communication.

**Architecture:** A single `WebSocketModule` (global) provides the gateway (auth + presence + dispatch), a `WsHandlerRegistry` (feature modules register incoming handlers at bootstrap), and a `WebSocketService` (outgoing emissions). Feature modules register handlers via `OnModuleInit` and inject `WebSocketService` to push events — no per-module gateways.

**Tech Stack:** NestJS, Socket.IO, `@nestjs/platform-socket.io`, `@socket.io/redis-adapter`, ioredis, Better Auth (session verification on connection), Vitest (e2e tests).

**Spec:** `docs/superpowers/specs/2026-06-24-global-websocket-design.md`

---

## File Structure

### Create

- `apps/backend/src/websocket/ws-handler.registry.ts` — Registry mapping event names to handler functions
- `apps/backend/src/websocket/websocket.gateway.ts` — Single domain-agnostic gateway (auth, presence, dispatch)
- `apps/backend/src/websocket/websocket.service.ts` — Injectable emission service
- `apps/backend/src/websocket/websocket.module.ts` — Global module wiring
- `apps/backend/src/modules/messaging/chat.handlers.ts` — Messaging handlers (join, leave, typing, heartbeat)
- `apps/backend/src/modules/notifications/notifications.handlers.ts` — Notifications handlers (markAsRead, markAllAsRead via WS)
- `apps/backend/test/e2e/websocket.e2e-spec.ts` — E2E tests for the registry and gateway dispatch

### Modify

- `apps/backend/src/websocket/presence.service.ts` — Move from `messaging/presence/presence.service.ts` (update import path)
- `apps/backend/src/app.module.ts` — Add `WebSocketModule`
- `apps/backend/src/modules/messaging/messaging.module.ts` — Import `WebSocketModule`, replace `MessagingGateway` with `ChatHandlers`, remove presence provider
- `apps/backend/src/modules/messaging/messages/messages.controller.ts` — Replace `MessagingGateway` with `WebSocketService`
- `apps/backend/src/modules/messaging/reactions/reactions.controller.ts` — Replace `MessagingGateway` with `WebSocketService`
- `apps/backend/src/modules/notifications/notifications.module.ts` — Import `WebSocketModule`, add `NotificationsHandlers`
- `apps/backend/src/modules/notifications/notifications.service.ts` — Inject `WebSocketService`, emit `notification:new` on `MESSAGE_NEW`

### Delete

- `apps/backend/src/modules/messaging/messaging.gateway.ts` — Replaced by `WebSocketGateway` + `ChatHandlers`
- `apps/backend/src/modules/messaging/presence/` — Moved to `websocket/presence.service.ts` (remove directory)

---

## Task 1: Create WsHandlerRegistry

**Files:**

- Create: `apps/backend/src/websocket/ws-handler.registry.ts`
- Test: `apps/backend/test/e2e/websocket.e2e-spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/backend/test/e2e/websocket.e2e-spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { WsHandlerRegistry } from "../../src/websocket/ws-handler.registry";

describe("WsHandlerRegistry", () => {
  it("registers and retrieves a handler", () => {
    const registry = new WsHandlerRegistry();
    const handler = () => {};
    registry.register("join", handler);
    expect(registry.getHandler("join")).toBe(handler);
  });

  it("returns undefined for unregistered event", () => {
    const registry = new WsHandlerRegistry();
    expect(registry.getHandler("nope")).toBeUndefined();
  });

  it("throws on duplicate registration", () => {
    const registry = new WsHandlerRegistry();
    registry.register("join", () => {});
    expect(() => registry.register("join", () => {})).toThrow(
      "Handler already registered for event: join",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/backend && bun run test:e2e -- websocket`
Expected: FAIL — module `../../src/websocket/ws-handler.registry` not found.

- [ ] **Step 3: Write minimal implementation**

Create `apps/backend/src/websocket/ws-handler.registry.ts`:

```typescript
// apps/backend/src/websocket/ws-handler.registry.ts
import { Injectable } from "@nestjs/common";
import type { Socket } from "socket.io";

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

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/backend && bun run test:e2e -- websocket`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/websocket/ws-handler.registry.ts apps/backend/test/e2e/websocket.e2e-spec.ts
git commit -m "feat(ws): add WsHandlerRegistry for dynamic handler registration"
```

---

## Task 2: Move PresenceService to websocket/

**Files:**

- Create: `apps/backend/src/websocket/presence.service.ts`
- Delete: `apps/backend/src/modules/messaging/presence/presence.service.ts`
- Delete: `apps/backend/src/modules/messaging/presence/` (empty directory)

- [ ] **Step 1: Create presence service at new location**

Create `apps/backend/src/websocket/presence.service.ts` with the same content as the current `messaging/presence/presence.service.ts` but with an updated header comment:

```typescript
// apps/backend/src/websocket/presence.service.ts
import { REDIS_TOKEN } from "@/redis/redis.module";
import { Inject, Injectable } from "@nestjs/common";
import IORedis from "ioredis";

const PRESENCE_TTL = 35; // seconds (slightly > 20s heartbeat interval)
const key = (userId: string) => `user:presence:${userId}`;

@Injectable()
export class PresenceService {
  constructor(@Inject(REDIS_TOKEN) private readonly redis: IORedis) {}

  async setOnline(userId: string): Promise<void> {
    await this.redis.set(key(userId), "1", "EX", PRESENCE_TTL);
  }

  async setOffline(userId: string): Promise<void> {
    await this.redis.del(key(userId));
  }

  async isOnline(userId: string): Promise<boolean> {
    return (await this.redis.get(key(userId))) !== null;
  }

  async refreshTtl(userId: string): Promise<void> {
    await this.redis.expire(key(userId), PRESENCE_TTL);
  }
}
```

- [ ] **Step 2: Delete the old file**

```bash
rm apps/backend/src/modules/messaging/presence/presence.service.ts
rmdir apps/backend/src/modules/messaging/presence
```

- [ ] **Step 3: Verify typecheck**

Run: `cd apps/backend && bun run check-types`
Expected: PASS (no references to the old path yet — `messaging.module.ts` still imports it, fix in Task 5).

If typecheck fails because `messaging.module.ts` still imports the old `PresenceService`, that's expected — it will be fixed in Task 5. Proceed only if the error is the expected missing-module error.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/websocket/presence.service.ts
git rm apps/backend/src/modules/messaging/presence/presence.service.ts
git commit -m "refactor(ws): move PresenceService from messaging/ to websocket/"
```

---

## Task 3: Create WebSocketService

**Files:**

- Create: `apps/backend/src/websocket/websocket.service.ts`

- [ ] **Step 1: Write the service**

Create `apps/backend/src/websocket/websocket.service.ts`:

```typescript
// apps/backend/src/websocket/websocket.service.ts
import { Injectable } from "@nestjs/common";
import { WebSocketServer } from "@nestjs/websockets";
import type { Server } from "socket.io";

@Injectable()
export class WebSocketService {
  @WebSocketServer()
  server: Server;

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

- [ ] **Step 2: Verify typecheck**

Run: `cd apps/backend && bun run check-types`
Expected: PASS (service compiles standalone; the `@WebSocketServer()` decorator resolves `Server` at runtime via NestJS).

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/websocket/websocket.service.ts
git commit -m "feat(ws): add WebSocketService for outgoing emissions"
```

---

## Task 4: Create WebSocketGateway and WebSocketModule

**Files:**

- Create: `apps/backend/src/websocket/websocket.gateway.ts`
- Create: `apps/backend/src/websocket/websocket.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Write the gateway**

Create `apps/backend/src/websocket/websocket.gateway.ts`:

```typescript
// apps/backend/src/websocket/websocket.gateway.ts
import { auth } from "@/auth/auth";
import { env } from "@/config/env";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { PresenceService } from "./presence.service";
import { WsHandlerRegistry } from "./ws-handler.registry";

@WebSocketGateway(env.WS_PORT, {
  cors: { origin: env.CORS_ORIGINS, credentials: true },
  transports: ["websocket", "polling"],
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

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
      this.server.emit("presence:offline", { userId });
    }
  }
}
```

- [ ] **Step 2: Write the module**

Create `apps/backend/src/websocket/websocket.module.ts`:

```typescript
// apps/backend/src/websocket/websocket.module.ts
import { Global, Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module";
import { PresenceService } from "./presence.service";
import { WebSocketGateway } from "./websocket.gateway";
import { WebSocketService } from "./websocket.service";
import { WsHandlerRegistry } from "./ws-handler.registry";

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

- [ ] **Step 3: Register WebSocketModule in AppModule**

Modify `apps/backend/src/app.module.ts`. Add the import and add `WebSocketModule` to the `imports` array, placed after `RedisModule` (since it depends on Redis):

Add import at top with the other local imports:

```typescript
import { WebSocketModule } from "./websocket/websocket.module";
```

Add to the `imports` array, right after `RedisModule`:

```typescript
    RedisModule,
    WebSocketModule,
    AuthModule.forRoot({ auth }),
```

- [ ] **Step 4: Verify typecheck**

Run: `cd apps/backend && bun run check-types`
Expected: PASS (the old `MessagingGateway` still exists and still references the old `PresenceService` path — that will be cleaned up in Task 5. If typecheck fails on `messaging.gateway.ts` importing the deleted presence service, proceed to Task 5 which removes it).

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/websocket/websocket.gateway.ts apps/backend/src/websocket/websocket.module.ts apps/backend/src/app.module.ts
git commit -m "feat(ws): add global WebSocketGateway and WebSocketModule"
```

---

## Task 5: Create ChatHandlers and refactor MessagingModule

**Files:**

- Create: `apps/backend/src/modules/messaging/chat.handlers.ts`
- Modify: `apps/backend/src/modules/messaging/messaging.module.ts`
- Delete: `apps/backend/src/modules/messaging/messaging.gateway.ts`

- [ ] **Step 1: Write ChatHandlers**

Create `apps/backend/src/modules/messaging/chat.handlers.ts`:

```typescript
// apps/backend/src/modules/messaging/chat.handlers.ts
import { WebSocketService } from "@/websocket/websocket.service";
import { PresenceService } from "@/websocket/presence.service";
import { WsHandlerRegistry } from "@/websocket/ws-handler.registry";
import { Injectable, OnModuleInit } from "@nestjs/common";
import type { Socket } from "socket.io";

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

- [ ] **Step 2: Rewrite messaging.module.ts**

Replace the entire content of `apps/backend/src/modules/messaging/messaging.module.ts`:

```typescript
// apps/backend/src/modules/messaging/messaging.module.ts
import { FilesModule } from "@/modules/files/files.module";
import { WebSocketModule } from "@/websocket/websocket.module";
import { Module } from "@nestjs/common";
import { ChatHandlers } from "./chat.handlers";
import { ConversationsController } from "./conversations/conversations.controller";
import { ConversationsRepository } from "./conversations/conversations.repository";
import { ConversationsService } from "./conversations/conversations.service";
import { MessagesController } from "./messages/messages.controller";
import { MessagesRepository } from "./messages/messages.repository";
import { MessagesService } from "./messages/messages.service";
import { ReactionsController } from "./reactions/reactions.controller";
import { ReactionsRepository } from "./reactions/reactions.repository";
import { ReactionsService } from "./reactions/reactions.service";

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

- [ ] **Step 3: Delete the old MessagingGateway**

```bash
git rm apps/backend/src/modules/messaging/messaging.gateway.ts
```

- [ ] **Step 4: Verify typecheck**

Run: `cd apps/backend && bun run check-types`
Expected: FAIL on `messages.controller.ts` and `reactions.controller.ts` — they still import `MessagingGateway`. This will be fixed in Task 6.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/messaging/chat.handlers.ts apps/backend/src/modules/messaging/messaging.module.ts
git commit -m "refactor(messaging): replace MessagingGateway with ChatHandlers"
```

---

## Task 6: Update controllers to use WebSocketService

**Files:**

- Modify: `apps/backend/src/modules/messaging/messages/messages.controller.ts`
- Modify: `apps/backend/src/modules/messaging/reactions/reactions.controller.ts`

- [ ] **Step 1: Update messages.controller.ts imports**

In `apps/backend/src/modules/messaging/messages/messages.controller.ts`, replace the import of `MessagingGateway`:

Replace:

```typescript
import { MessagingGateway } from "../messaging.gateway";
import { MessagesService } from "./messages.service";
```

With:

```typescript
import { WebSocketService } from "@/websocket/websocket.service";
import { MessagesService } from "./messages.service";
```

- [ ] **Step 2: Update MessagesController constructor**

In the same file, replace the constructor:

Replace:

```typescript
  constructor(
    private readonly messagesService: MessagesService,
    private readonly gateway: MessagingGateway,
  ) {}
```

With:

```typescript
  constructor(
    private readonly messagesService: MessagesService,
    private readonly webSocketService: WebSocketService,
  ) {}
```

- [ ] **Step 3: Replace all gateway.emitToConversation calls in messages.controller.ts**

Replace every occurrence of:

```typescript
this.gateway.emitToConversation(id, "message:new", message);
```

With:

```typescript
this.webSocketService.emitToRoom(`conv:${id}`, "message:new", message);
```

Replace:

```typescript
this.gateway.emitToConversation(id, "message:updated", message);
```

With:

```typescript
this.webSocketService.emitToRoom(`conv:${id}`, "message:updated", message);
```

Replace:

```typescript
this.gateway.emitToConversation(id, "message:deleted", {
  messageId: msgId,
});
```

With:

```typescript
this.webSocketService.emitToRoom(`conv:${id}`, "message:deleted", {
  messageId: msgId,
});
```

Replace:

```typescript
this.gateway.emitToConversation(
  body.targetConversationId,
  "message:new",
  forwardedMsg,
);
```

With:

```typescript
this.webSocketService.emitToRoom(
  `conv:${body.targetConversationId}`,
  "message:new",
  forwardedMsg,
);
```

- [ ] **Step 4: Update reactions.controller.ts imports**

In `apps/backend/src/modules/messaging/reactions/reactions.controller.ts`, replace the import:

Replace:

```typescript
import { MessagingGateway } from "../messaging.gateway";
import { ReactionsService } from "./reactions.service";
```

With:

```typescript
import { WebSocketService } from "@/websocket/websocket.service";
import { ReactionsService } from "./reactions.service";
```

- [ ] **Step 5: Update ReactionsController constructor**

In the same file, replace the constructor:

Replace:

```typescript
  constructor(
    private readonly reactionsService: ReactionsService,
    private readonly messagingGateway: MessagingGateway,
  ) {}
```

With:

```typescript
  constructor(
    private readonly reactionsService: ReactionsService,
    private readonly webSocketService: WebSocketService,
  ) {}
```

- [ ] **Step 6: Replace gateway calls in reactions.controller.ts**

Replace both occurrences of:

```typescript
this.messagingGateway.emitToConversation(id, "message:reaction", {
  messageId: msgId,
  emoji,
  added: result.added,
  reactions: result.reactions,
});
```

With:

```typescript
this.webSocketService.emitToRoom(`conv:${id}`, "message:reaction", {
  messageId: msgId,
  emoji,
  added: result.added,
  reactions: result.reactions,
});
```

(There are two occurrences: one in `toggleReaction` and one in `removeReaction`.)

- [ ] **Step 7: Verify typecheck**

Run: `cd apps/backend && bun run check-types`
Expected: PASS — no more references to `MessagingGateway` anywhere.

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/modules/messaging/messages/messages.controller.ts apps/backend/src/modules/messaging/reactions/reactions.controller.ts
git commit -m "refactor(messaging): controllers use WebSocketService instead of MessagingGateway"
```

---

## Task 7: Create NotificationsHandlers and wire WebSocket into NotificationsModule

**Files:**

- Create: `apps/backend/src/modules/notifications/notifications.handlers.ts`
- Modify: `apps/backend/src/modules/notifications/notifications.module.ts`
- Modify: `apps/backend/src/modules/notifications/notifications.service.ts`

- [ ] **Step 1: Write NotificationsHandlers**

Create `apps/backend/src/modules/notifications/notifications.handlers.ts`:

```typescript
// apps/backend/src/modules/notifications/notifications.handlers.ts
import { WebSocketService } from "@/websocket/websocket.service";
import { WsHandlerRegistry } from "@/websocket/ws-handler.registry";
import { Injectable, OnModuleInit } from "@nestjs/common";
import type { Socket } from "socket.io";
import { NotificationsService } from "./notifications.service";

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

- [ ] **Step 2: Rewrite notifications.module.ts**

Replace the entire content of `apps/backend/src/modules/notifications/notifications.module.ts`:

```typescript
// apps/backend/src/modules/notifications/notifications.module.ts
import { WebSocketModule } from "@/websocket/websocket.module";
import { Module } from "@nestjs/common";
import { NotificationsHandlers } from "./notifications.handlers";
import { NotificationsController } from "./notifications.controller";
import { NotificationsRepository } from "./notifications.repository";
import { NotificationsService } from "./notifications.service";

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

- [ ] **Step 3: Update notifications.service.ts to emit via WebSocket**

In `apps/backend/src/modules/notifications/notifications.service.ts`:

Add the import at the top with the other imports:

```typescript
import { WebSocketService } from "@/websocket/websocket.service";
```

Update the constructor to inject `WebSocketService`:

Replace:

```typescript
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}
```

With:

```typescript
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly webSocketService: WebSocketService,
  ) {}
```

Update the `handleNewMessage` method to emit real-time notifications. Replace the entire `handleNewMessage` method:

Replace:

```typescript
  @OnEvent(DomainEvent.MESSAGE_NEW)
  async handleNewMessage(event: MessageNewEvent): Promise<void> {
    const title =
      event.conversationType === 'group'
        ? `${event.senderName} dans ${event.conversationName ?? 'le groupe'}`
        : event.senderName;

    await Promise.all(
      event.recipientIds.map((userId) =>
        this.notificationsRepository.create({
          userId,
          type: 'new_message',
          title,
          body: event.preview,
          data: {
            conversationId: event.conversationId,
            messageId: event.messageId,
            senderId: event.senderId,
          },
        }),
      ),
    );
  }
```

With:

```typescript
  @OnEvent(DomainEvent.MESSAGE_NEW)
  async handleNewMessage(event: MessageNewEvent): Promise<void> {
    const title =
      event.conversationType === 'group'
        ? `${event.senderName} dans ${event.conversationName ?? 'le groupe'}`
        : event.senderName;

    await Promise.all(
      event.recipientIds.map((userId) =>
        this.notificationsRepository.create({
          userId,
          type: 'new_message',
          title,
          body: event.preview,
          data: {
            conversationId: event.conversationId,
            messageId: event.messageId,
            senderId: event.senderId,
          },
        }),
      ),
    );

    for (const userId of event.recipientIds) {
      this.webSocketService.emitToUser(userId, 'notification:new', {
        type: 'new_message',
        title,
        body: event.preview,
        data: {
          conversationId: event.conversationId,
          messageId: event.messageId,
          senderId: event.senderId,
        },
      });
    }
  }
```

- [ ] **Step 4: Verify typecheck**

Run: `cd apps/backend && bun run check-types`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/notifications/notifications.handlers.ts apps/backend/src/modules/notifications/notifications.module.ts apps/backend/src/modules/notifications/notifications.service.ts
git commit -m "feat(notifications): add WebSocket handlers and real-time emission"
```

---

## Task 8: Final verification and cleanup

**Files:**

- Verify: no lingering references to `MessagingGateway` or old `presence/` path

- [ ] **Step 1: Search for any remaining references to MessagingGateway**

Run: `rg "MessagingGateway" apps/backend/src`
Expected: no matches.

- [ ] **Step 2: Search for any remaining references to the old presence path**

Run: `rg "messaging/presence" apps/backend/src`
Expected: no matches.

- [ ] **Step 3: Run full typecheck**

Run: `cd apps/backend && bun run check-types`
Expected: PASS.

- [ ] **Step 4: Run e2e tests**

Run: `cd apps/backend && bun run test:e2e`
Expected: PASS (existing e2e tests + new websocket registry tests).

- [ ] **Step 5: Run lint**

Run: `cd apps/backend && bun run lint`
Expected: PASS.

- [ ] **Step 6: Commit any lint fixes if needed**

```bash
git add -A
git commit -m "chore: lint cleanup after websocket refactor"
```

(Only if lint made changes. Otherwise skip this step.)
