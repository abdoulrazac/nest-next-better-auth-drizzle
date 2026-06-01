// apps/backend/src/modules/notifications/notifications.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/database/database.module';
import type { db as DbType } from '@repo/db';
import { notification } from '@repo/db';
import { eq, and, count, inArray } from 'drizzle-orm';
import {
  notificationResponseSchema,
  notificationsPaginatedResponseSchema,
  unreadCountResponseSchema,
  type NotificationResponse,
  type NotificationsPaginatedResponse,
  type NotificationUnreadCountResponse,
} from '@repo/validators/notifications';

type DB = typeof DbType;

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  private readonly notificationArraySchema = notificationResponseSchema.array();

  async findAllForUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<NotificationsPaginatedResponse> {
    const offset = (page - 1) * limit;
    const where = eq(notification.userId, userId);

    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(notification)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(notification.createdAt),
      this.db.select({ total: count() }).from(notification).where(where),
    ]);

    return notificationsPaginatedResponseSchema.parse({
      items,
      total,
      page,
      limit,
    });
  }

  async markAsRead(
    userId: string,
    ids: string[],
  ): Promise<NotificationResponse[]> {
    const rows = await this.db
      .update(notification)
      .set({ read: true, readAt: new Date() })
      .where(
        and(eq(notification.userId, userId), inArray(notification.id, ids)),
      )
      .returning();

    return this.notificationArraySchema.parse(rows);
  }

  async markAllAsRead(userId: string): Promise<NotificationResponse[]> {
    const rows = await this.db
      .update(notification)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(notification.userId, userId), eq(notification.read, false)))
      .returning();

    return this.notificationArraySchema.parse(rows);
  }

  async delete(
    userId: string,
    id: string,
  ): Promise<NotificationResponse | null> {
    const [deleted] = await this.db
      .delete(notification)
      .where(and(eq(notification.id, id), eq(notification.userId, userId)))
      .returning();

    if (!deleted) return null;
    return notificationResponseSchema.parse(deleted);
  }

  async countUnread(userId: string): Promise<NotificationUnreadCountResponse> {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(notification)
      .where(
        and(eq(notification.userId, userId), eq(notification.read, false)),
      );

    return unreadCountResponseSchema.parse({ total });
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown> | null;
  }): Promise<NotificationResponse> {
    const [created] = await this.db
      .insert(notification)
      .values(data)
      .returning();

    return notificationResponseSchema.parse(created);
  }
}
