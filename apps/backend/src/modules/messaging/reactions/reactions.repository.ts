// apps/backend/src/modules/messaging/reactions/reactions.repository.ts
import { DATABASE_TOKEN } from '@/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import type { db as DbType } from '@repo/db';
import { messageReaction } from '@repo/db';
import {
  reactionSummarySchema,
  type ReactionSummary,
} from '@repo/validators/messages';
import { and, eq, sql } from 'drizzle-orm';

type DB = typeof DbType;

@Injectable()
export class ReactionsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  private readonly reactionSummaryArraySchema = reactionSummarySchema.array();

  async findByMessage(messageId: string): Promise<ReactionSummary[]> {
    const rows = await this.db
      .select({
        emoji: messageReaction.emoji,
        count: sql<number>`count(*)::int`,
        userIds: sql<string[]>`array_agg(${messageReaction.userId})`,
      })
      .from(messageReaction)
      .where(eq(messageReaction.messageId, messageId))
      .groupBy(messageReaction.emoji);

    return this.reactionSummaryArraySchema.parse(rows);
  }

  async findOne(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<typeof messageReaction.$inferSelect | null> {
    const [row] = await this.db
      .select()
      .from(messageReaction)
      .where(
        and(
          eq(messageReaction.messageId, messageId),
          eq(messageReaction.userId, userId),
          eq(messageReaction.emoji, emoji),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async create(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<typeof messageReaction.$inferSelect> {
    const [created] = await this.db
      .insert(messageReaction)
      .values({ messageId, userId, emoji })
      .returning();
    return created;
  }

  async delete(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<void> {
    await this.db
      .delete(messageReaction)
      .where(
        and(
          eq(messageReaction.messageId, messageId),
          eq(messageReaction.userId, userId),
          eq(messageReaction.emoji, emoji),
        ),
      );
  }
}
