// apps/backend/src/modules/accounts/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { db, user } from '@repo/db';
import { eq, ilike, count, and, type SQL } from 'drizzle-orm';

export interface FindUsersOptions {
  page: number;
  limit: number;
  search?: string;
}

@Injectable()
export class UsersRepository {
  async findAll(options: FindUsersOptions) {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (search) {
      conditions.push(ilike(user.name, `%${search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(user)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(user.createdAt),
      db.select({ total: count() }).from(user).where(where),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    const [found] = await db.select().from(user).where(eq(user.id, id));
    return found ?? null;
  }

  async findByEmail(email: string) {
    const [found] = await db.select().from(user).where(eq(user.email, email));
    return found ?? null;
  }

  async update(id: string, data: Partial<typeof user.$inferInsert>) {
    const [updated] = await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return updated ?? null;
  }

  async ban(id: string, reason?: string, expiresAt?: Date) {
    return this.update(id, {
      banned: true,
      banReason: reason,
      banExpires: expiresAt,
    });
  }

  async unban(id: string) {
    return this.update(id, {
      banned: false,
      banReason: null,
      banExpires: null,
    });
  }
}
