import {
  bigint,
  customType,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { type AnyPgColumn } from "drizzle-orm/pg-core";
import { user } from "./auth";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const conversation = pgTable("conversation", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type", { enum: ["direct", "group"] })
    .notNull()
    .default("direct"),
  name: text("name"),
  organizationId: uuid("organization_id"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversationParticipant = pgTable(
  "conversation_participant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["member", "admin"] })
      .notNull()
      .default("member"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    lastReadAt: timestamp("last_read_at"),
  },
  (table) => [
    index("conv_participant_conv_id_idx").on(table.conversationId),
    index("conv_participant_user_id_idx").on(table.userId),
    uniqueIndex("conv_participant_unique_idx").on(
      table.conversationId,
      table.userId,
    ),
  ],
);

export const message = pgTable(
  "message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    // Nullable — SET NULL when user is deleted, body is preserved
    senderId: text("sender_id").references(() => user.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    editedAt: timestamp("edited_at"),
    // Self-referential — reply threading
    replyToId: uuid("reply_to_id").references((): AnyPgColumn => message.id, {
      onDelete: "set null",
    }),
    quotedBody: text("quoted_body"),
    quotedSenderId: text("quoted_sender_id"),
    // Self-referential — message forwarding
    forwardedFromId: uuid("forwarded_from_id").references(
      (): AnyPgColumn => message.id,
      { onDelete: "set null" },
    ),
    // Full-text search — updated via to_tsvector() on insert/edit
    bodySearch: tsvector("body_search"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("message_conversation_id_idx").on(table.conversationId),
    index("message_sender_id_idx").on(table.senderId),
    index("message_body_search_gin_idx").using("gin", table.bodySearch),
  ],
);

export const messageAttachment = pgTable(
  "message_attachment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["file", "image", "voice"] })
      .notNull()
      .default("file"),
    key: text("key").notNull(),
    url: text("url").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
    // Seconds — only populated for type = 'voice'
    duration: integer("duration"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("msg_attachment_message_id_idx").on(table.messageId)],
);

export const messageReaction = pgTable(
  "message_reaction",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("message_reaction_unique_idx").on(
      table.messageId,
      table.userId,
      table.emoji,
    ),
    index("message_reaction_message_id_idx").on(table.messageId),
  ],
);
