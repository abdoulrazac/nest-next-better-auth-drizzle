// apps/backend/src/modules/messaging/conversations/conversations.repository.ts
import { DATABASE_TOKEN } from '@/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import type { db as DbType } from '@repo/db';
import { conversation, conversationParticipant } from '@repo/db';
import type {
  ConversationResponse,
  PaginatedResponse,
  ParticipantResponse,
} from '@repo/validators/messages';
import {
  conversationResponseSchema,
  paginatedResponseSchema,
  participantResponseSchema,
} from '@repo/validators/messages';
import { and, count, desc, eq, inArray, isNull } from 'drizzle-orm';

type DB = typeof DbType;

@Injectable()
export class ConversationsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  private readonly conversationArraySchema = conversationResponseSchema.array();
  private readonly participantArraySchema = participantResponseSchema.array();
  private readonly paginatedConversationSchema = paginatedResponseSchema(
    conversationResponseSchema,
  );

  async create(
    type: 'direct' | 'group',
    name: string | undefined | null,
    createdBy: string,
    participantIds: string[],
    organizationId?: string,
  ): Promise<ConversationResponse> {
    return this.db.transaction(async (tx) => {
      const [conv] = await tx
        .insert(conversation)
        .values({ type, name, createdBy, organizationId })
        .returning();

      await tx.insert(conversationParticipant).values(
        participantIds.map((userId) => ({
          conversationId: conv.id,
          userId,
          role: userId === createdBy ? ('admin' as const) : ('member' as const),
        })),
      );

      return conversationResponseSchema.parse(conv);
    });
  }

  async findDirectConversation(
    userA: string,
    userB: string,
  ): Promise<{ id: string } | null> {
    const [result] = await this.db
      .select({ id: conversation.id })
      .from(conversation)
      .where(
        and(
          eq(conversation.type, 'direct'),
          inArray(
            conversation.id,
            this.db
              .select({ id: conversationParticipant.conversationId })
              .from(conversationParticipant)
              .where(eq(conversationParticipant.userId, userA)),
          ),
          inArray(
            conversation.id,
            this.db
              .select({ id: conversationParticipant.conversationId })
              .from(conversationParticipant)
              .where(eq(conversationParticipant.userId, userB)),
          ),
        ),
      )
      .limit(1);

    return result ?? null;
  }

  async findForUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<ConversationResponse>> {
    const offset = (page - 1) * limit;

    const where = and(
      inArray(
        conversation.id,
        this.db
          .select({ id: conversationParticipant.conversationId })
          .from(conversationParticipant)
          .where(eq(conversationParticipant.userId, userId)),
      ),
      isNull(conversation.archivedAt),
    );

    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(conversation)
        .where(where)
        .orderBy(desc(conversation.updatedAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(conversation).where(where),
    ]);

    return this.paginatedConversationSchema.parse({
      items,
      total,
      page,
      limit,
    });
  }

  async findById(id: string): Promise<ConversationResponse | null> {
    const [result] = await this.db
      .select()
      .from(conversation)
      .where(eq(conversation.id, id));

    if (!result) return null;
    return conversationResponseSchema.parse(result);
  }

  async findParticipants(
    conversationId: string,
  ): Promise<ParticipantResponse[]> {
    const results = await this.db
      .select()
      .from(conversationParticipant)
      .where(eq(conversationParticipant.conversationId, conversationId));

    return this.participantArraySchema.parse(results);
  }

  async getParticipant(
    conversationId: string,
    userId: string,
  ): Promise<ParticipantResponse | null> {
    const [result] = await this.db
      .select()
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, userId),
        ),
      );

    if (!result) return null;
    return participantResponseSchema.parse(result);
  }

  async isParticipant(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.getParticipant(conversationId, userId);
    return result !== null;
  }

  async addParticipant(conversationId: string, userId: string): Promise<void> {
    await this.db
      .insert(conversationParticipant)
      .values({ conversationId, userId, role: 'member' });
  }

  async removeParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await this.db
      .delete(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, userId),
        ),
      );
  }

  async updateLastRead(conversationId: string, userId: string): Promise<void> {
    await this.db
      .update(conversationParticipant)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, userId),
        ),
      );
  }

  async touchConversation(conversationId: string): Promise<void> {
    await this.db
      .update(conversation)
      .set({ updatedAt: new Date() })
      .where(eq(conversation.id, conversationId));
  }

  async archive(conversationId: string): Promise<void> {
    await this.db
      .update(conversation)
      .set({ archivedAt: new Date() })
      .where(eq(conversation.id, conversationId));
  }

  async rename(conversationId: string, name: string): Promise<void> {
    await this.db
      .update(conversation)
      .set({ name })
      .where(eq(conversation.id, conversationId));
  }
}
