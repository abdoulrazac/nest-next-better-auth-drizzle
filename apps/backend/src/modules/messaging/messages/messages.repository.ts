// apps/backend/src/modules/messaging/messages/messages.repository.ts
import { DATABASE_TOKEN } from '@/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import type { db as DbType } from '@repo/db';
import { message, messageAttachment } from '@repo/db';
import type {
  AttachmentResponse,
  MessageResponse,
} from '@repo/validators/messages';
import {
  attachmentResponseSchema,
  messageResponseSchema,
} from '@repo/validators/messages';
import { and, desc, eq, inArray, isNull, lt, sql } from 'drizzle-orm';

type DB = typeof DbType;

type MessageRow = typeof message.$inferSelect;

interface AttachmentData {
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: 'file' | 'image' | 'voice';
  duration?: number;
}

interface CreateMessageData {
  conversationId: string;
  senderId: string;
  body: string;
  replyToId?: string;
  quotedBody?: string;
  quotedSenderId?: string;
  forwardedFromId?: string;
  attachments: AttachmentData[];
}

/**
 * The `message` table uses circular self-referential FK columns (replyToId,
 * forwardedFromId) declared with `AnyPgColumn`, which breaks Drizzle's TypeScript
 * inference for the insert/update types — those columns simply disappear from the
 * inferred type.  The `tsvector` customType (bodySearch) has the same issue.
 *
 * The casts below (`as unknown as typeof message.$inferInsert`) are intentional
 * workarounds. Runtime behaviour is correct; the SQL produced is fully type-safe.
 */
type MessageInsert = typeof message.$inferInsert;

@Injectable()
export class MessagesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  private readonly messageArrayResponseSchema = messageResponseSchema.array();
  private readonly attachmentArrayResponseSchema =
    attachmentResponseSchema.array();

  async create(data: CreateMessageData): Promise<MessageResponse> {
    return this.db.transaction(async (tx) => {
      const [msg] = await tx
        .insert(message)
        .values({
          conversationId: data.conversationId,
          senderId: data.senderId,
          body: data.body,
          replyToId: data.replyToId ?? null,
          quotedBody: data.quotedBody ?? null,
          quotedSenderId: data.quotedSenderId ?? null,
          forwardedFromId: data.forwardedFromId ?? null,
        } as unknown as MessageInsert)
        .returning();

      // bodySearch is a tsvector customType — Drizzle cannot type-safely accept
      // a sql`` expression in .values(), so we set it in a follow-up statement.
      await tx.execute(
        sql`UPDATE "message" SET body_search = to_tsvector('french', ${data.body}) WHERE id = ${msg.id}`,
      );

      let attachments: AttachmentResponse[] = [];
      if (data.attachments.length > 0) {
        const insertedAttachments = await tx
          .insert(messageAttachment)
          .values(
            data.attachments.map((att) => ({
              messageId: msg.id,
              ...att,
            })),
          )
          .returning();

        attachments =
          this.attachmentArrayResponseSchema.parse(insertedAttachments);
      }

      return messageResponseSchema.parse({ ...msg, attachments });
    });
  }

  async findInConversation(
    conversationId: string,
    joinedAt: Date,
    limit: number,
    before?: string,
    search?: string,
  ): Promise<MessageResponse[]> {
    // Resolve pagination cursor before building the query
    let cursorDate: Date | undefined;
    if (before) {
      const [cursor] = await this.db
        .select({ createdAt: message.createdAt })
        .from(message)
        .where(eq(message.id, before));
      cursorDate = cursor?.createdAt;
    }

    const messages = await this.db
      .select()
      .from(message)
      .where(
        and(
          eq(message.conversationId, conversationId),
          isNull(message.deletedAt),
          sql`${message.createdAt} >= ${joinedAt}`,
          cursorDate ? lt(message.createdAt, cursorDate) : undefined,
          // message.bodySearch is not reachable via the broken inferred type —
          // reference the column directly via raw SQL instead.
          search
            ? sql`"message"."body_search" @@ plainto_tsquery('french', ${search})`
            : undefined,
        ),
      )
      .orderBy(desc(message.createdAt))
      .limit(limit);

    return this.withAttachments(messages);
  }

  async findById(id: string): Promise<MessageResponse | null> {
    const [found] = await this.db
      .select()
      .from(message)
      .where(eq(message.id, id));

    if (!found) return null;

    const [withAtts] = await this.withAttachments([found]);
    return withAtts ?? null;
  }

  async update(
    id: string,
    senderId: string,
    body: string,
  ): Promise<MessageResponse | null> {
    const [updated] = await this.db
      .update(message)
      // editedAt is missing from the inferred set-type for the same reason as above
      .set({
        body,
        editedAt: new Date(),
        updatedAt: new Date(),
      } as unknown as MessageInsert)
      .where(
        and(
          eq(message.id, id),
          eq(message.senderId, senderId),
          isNull(message.deletedAt),
        ),
      )
      .returning();

    if (!updated) return null;

    await this.db.execute(
      sql`UPDATE "message" SET body_search = to_tsvector('french', ${body}) WHERE id = ${id}`,
    );

    const [withAtts] = await this.withAttachments([updated]);
    return withAtts ?? null;
  }

  async softDelete(
    id: string,
    senderId: string,
  ): Promise<MessageResponse | null> {
    const [deleted] = await this.db
      .update(message)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(message.id, id),
          eq(message.senderId, senderId),
          isNull(message.deletedAt),
        ),
      )
      .returning();

    if (!deleted) return null;
    const [withAtts] = await this.withAttachments([deleted]);
    return withAtts ?? null;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async withAttachments(
    messages: MessageRow[],
  ): Promise<MessageResponse[]> {
    if (messages.length === 0) return [];

    const messageIds = messages.map((m) => m.id);
    // Cast to AttachmentResponse[] — Drizzle's inferred type omits `type` and
    // `duration` columns due to enum/customType inference limitations.
    const attachments = await this.db
      .select()
      .from(messageAttachment)
      .where(inArray(messageAttachment.messageId, messageIds));

    const parsedAttachments =
      this.attachmentArrayResponseSchema.parse(attachments);

    const byMessageId = new Map<string, AttachmentResponse[]>();
    for (const att of parsedAttachments) {
      const list = byMessageId.get(att.messageId) ?? [];
      list.push(att);
      byMessageId.set(att.messageId, list);
    }

    return this.messageArrayResponseSchema.parse(
      messages.map((msg) => ({
        ...msg,
        attachments: byMessageId.get(msg.id) ?? [],
      })),
    );
  }
}
