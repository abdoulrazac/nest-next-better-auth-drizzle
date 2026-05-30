// apps/backend/src/modules/notifications/notifications.repository.ts
import { Injectable } from '@nestjs/common';
import { db, notification } from '@repo/db';
import { eq, and, count, inArray } from 'drizzle-orm';

@Injectable()
export class NotificationsRepository {
  async findAllForUser(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const where = eq(notification.userId, userId);

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(notification)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(notification.createdAt),
      db.select({ total: count() }).from(notification).where(where),
    ]);

    return { items, total, page, limit };
  }

  async markAsRead(userId: string, ids: string[]) {
    return db
      .update(notification)
      .set({ read: true, readAt: new Date() })
      .where(
        and(eq(notification.userId, userId), inArray(notification.id, ids)),
      )
      .returning();
  }

  async markAllAsRead(userId: string) {
    return db
      .update(notification)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(notification.userId, userId), eq(notification.read, false)))
      .returning();
  }

  async delete(userId: string, id: string) {
    const [deleted] = await db
      .delete(notification)
      .where(and(eq(notification.id, id), eq(notification.userId, userId)))
      .returning();
    return deleted ?? null;
  }

  async countUnread(userId: string) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(notification)
      .where(
        and(eq(notification.userId, userId), eq(notification.read, false)),
      );
    return total;
  }
}
