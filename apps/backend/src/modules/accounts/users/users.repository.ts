// apps/backend/src/modules/accounts/users/users.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/database/database.module';
import type { db as DbType } from '@repo/db';
import { user } from '@repo/db';
import { eq, ilike, count, and, type SQL } from 'drizzle-orm';
import {
  userResponseSchema,
  usersPaginatedResponseSchema,
  type UserResponse,
  type UsersPaginatedResponse,
} from '@repo/validators/accounts';

type DB = typeof DbType;

export interface FindUsersOptions {
  page: number;
  limit: number;
  search?: string;
}

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  async findAll(options: FindUsersOptions): Promise<UsersPaginatedResponse> {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (search) {
      conditions.push(ilike(user.name, `%${search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(user)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(user.createdAt),
      this.db.select({ total: count() }).from(user).where(where),
    ]);

    return usersPaginatedResponseSchema.parse({ items, total, page, limit });
  }

  async findById(id: string): Promise<UserResponse | null> {
    const [found] = await this.db.select().from(user).where(eq(user.id, id));
    if (!found) return null;
    return userResponseSchema.parse(found);
  }

  async findByEmail(email: string): Promise<UserResponse | null> {
    const [found] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email));
    if (!found) return null;
    return userResponseSchema.parse(found);
  }

  async update(
    id: string,
    data: Partial<typeof user.$inferInsert>,
  ): Promise<UserResponse | null> {
    const [updated] = await this.db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    if (!updated) return null;
    return userResponseSchema.parse(updated);
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
