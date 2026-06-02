---
name: nest-event
description: Use when adding a new domain event to the NestJS backend — defining the event type, emitting it from a service, or creating a listener/handler for it. Also use when deciding whether to use events vs direct service calls for cross-module side effects.
---

# Domain Events in This NestJS Project

This project uses **`@nestjs/event-emitter`** (wrapping `eventemitter2`) for in-process, loosely-coupled domain events. Events decouple the emitting module from the modules reacting to it — the messaging module doesn't import the notifications module; it just fires an event.

## Key files

| File                                                              | Role                                                                               |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `apps/backend/src/events/domain-events.ts`                        | Central registry of event name constants and payload interfaces                    |
| `apps/backend/src/app.module.ts`                                  | `EventEmitterModule.forRoot()` is registered globally — no per-module setup needed |
| `apps/backend/src/modules/messaging/messages/messages.service.ts` | Example emitter: injects `EventEmitter2` and calls `.emit()`                       |
| `apps/backend/src/modules/notifications/notifications.service.ts` | Example listener: uses `@OnEvent()` decorator                                      |

---

## 1. Define the event

Add a constant key and payload interface to `domain-events.ts`:

```ts
// apps/backend/src/events/domain-events.ts

export const DomainEvent = {
  WEBHOOK_DISPATCH: "webhook.dispatch",
  MESSAGE_NEW: "message.new",

  // Add your new event here:
  USER_REGISTERED: "user.registered",
} as const;

// Add the payload interface:
export interface UserRegisteredEvent {
  userId: string;
  email: string;
  registeredAt: Date;
}
```

Rules:

- Event names follow `noun.verb` kebab-case (e.g. `order.placed`, `file.uploaded`).
- Keep payload interfaces in this file — it's the single source of truth for the event contract.

---

## 2. Emit the event from a service

Inject `EventEmitter2` and call `.emit()` after the primary operation succeeds:

```ts
// apps/backend/src/modules/accounts/accounts.service.ts
import { DomainEvent, type UserRegisteredEvent } from "@/events/domain-events";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class AccountsService {
  constructor(
    // ...other deps,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(input: RegisterInput) {
    const user = await this.usersRepository.create(input);

    const event: UserRegisteredEvent = {
      userId: user.id,
      email: user.email,
      registeredAt: new Date(),
    };
    this.eventEmitter.emit(DomainEvent.USER_REGISTERED, event);

    return user;
  }
}
```

Notes:

- `.emit()` is synchronous by default (fire-and-forget). Listeners that are `async` run independently.
- Emit **after** the DB write succeeds so a failed persist doesn't trigger side effects.
- No need to import or inject the listener module.

---

## 3. Create a listener

Add `@OnEvent(DomainEvent.YOUR_EVENT)` to a method in any `@Injectable()` service:

```ts
// apps/backend/src/modules/mailer/mailer.service.ts
import { DomainEvent, type UserRegisteredEvent } from "@/events/domain-events";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class MailerService {
  @OnEvent(DomainEvent.USER_REGISTERED)
  async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    await this.sendWelcomeEmail(event.email);
  }
}
```

Real project example — `NotificationsService` listens for new messages:

```ts
// notifications.service.ts
@OnEvent(DomainEvent.MESSAGE_NEW)
async handleNewMessage(event: MessageNewEvent): Promise<void> {
  await Promise.all(
    event.recipientIds.map((userId) =>
      this.notificationsRepository.create({
        userId,
        type: 'new_message',
        title: event.senderName,
        body: event.preview,
        data: { conversationId: event.conversationId, messageId: event.messageId },
      }),
    ),
  );
}
```

---

## 4. Register the listener in its module

No special event registration is needed. Just make sure the service containing `@OnEvent` is listed as a `provider` in its module:

```ts
// apps/backend/src/modules/mailer/mailer.module.ts
import { Module } from "@nestjs/common";
import { MailerService } from "./mailer.service";

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
```

Then import that module somewhere in `AppModule` (or in the module graph). `EventEmitterModule.forRoot()` is already global — no re-import needed.

Real example: `NotificationsModule` just lists `NotificationsService` as a provider:

```ts
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

---

## Events vs direct service calls

| Situation                                                                        | Use             |
| -------------------------------------------------------------------------------- | --------------- |
| Side effect lives in **another module** and you don't want a circular import     | **Event**       |
| Multiple modules react to the same thing (fan-out)                               | **Event**       |
| The reaction is **optional / best-effort** (notifications, audit logs, webhooks) | **Event**       |
| You need the **result** of the secondary operation in the same request           | **Direct call** |
| The secondary operation must succeed or the whole transaction should roll back   | **Direct call** |
| Same module, tightly coupled workflow                                            | **Direct call** |

---

## Checklist for a new event

- [ ] Add constant to `DomainEvent` object in `domain-events.ts`
- [ ] Add payload interface in `domain-events.ts`
- [ ] Inject `EventEmitter2` into the emitting service
- [ ] Call `this.eventEmitter.emit(DomainEvent.YOUR_EVENT, payload)` after the primary operation
- [ ] Add `@OnEvent(DomainEvent.YOUR_EVENT)` handler method in the listener service
- [ ] Ensure the listener service is a `provider` in its module
- [ ] Ensure the listener module is imported into the app module graph
