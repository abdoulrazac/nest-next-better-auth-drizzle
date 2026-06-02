import { z } from "zod";
import {
  fileAttachmentTypeSchema,
  nonEmptyStringSchema,
  paginatedResponseSchema,
  paginationLimitSchema,
  paginationPageSchema,
  uuidSchema,
} from "./shared.schema";

const BLOCKED_EXTENSIONS = [
  ".exe",
  ".msi",
  ".bat",
  ".sh",
  ".ps1",
  ".dmg",
  ".app",
  ".cmd",
  ".com",
  ".vbs",
];

const BLOCKED_MIME_PREFIXES = [
  "application/x-msdownload",
  "application/x-executable",
  "application/x-sh",
  "application/x-msdos-program",
  "application/x-bat",
];

const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25 MB

const attachmentSchema = z.object({
  key: nonEmptyStringSchema,
  originalName: z
    .string()
    .min(1)
    .refine(
      (name) =>
        !BLOCKED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)),
      { message: "This file type is not allowed" },
    ),
  mimeType: z
    .string()
    .min(1)
    .refine(
      (mime) =>
        !BLOCKED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix)),
      { message: "This MIME type is not allowed" },
    ),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_ATTACHMENT_SIZE, "File size cannot exceed 25 MB"),
  type: fileAttachmentTypeSchema,
  duration: z.number().int().positive().optional(),
});

export const createConversationSchema = z
  .object({
    type: z.enum(["direct", "group"]).default("direct"),
    name: z.string().min(1).max(100).optional(),
    participantIds: z.array(z.string()).min(1).max(50),
  })
  .refine((data) => data.type !== "group" || !!data.name?.trim(), {
    message: "Group conversations must have a name",
    path: ["name"],
  });

export const renameConversationSchema = z.object({
  name: z.string().min(1).max(100),
});

export const addParticipantSchema = z.object({
  userId: nonEmptyStringSchema,
});

export const sendMessageSchema = z
  .object({
    body: z.string().max(5000).default(""),
    replyToId: uuidSchema.optional(),
    forwardedFromId: uuidSchema.optional(),
    attachments: z.array(attachmentSchema).default([]),
  })
  .refine(
    (data) => data.body.trim().length > 0 || data.attachments.length > 0,
    {
      message: "Message must have either text content or attachments",
    },
  );

export const editMessageSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const forwardMessageSchema = z.object({
  targetConversationId: uuidSchema,
  body: z.string().max(5000).default(""),
});

export const attachmentPresignedUrlSchema = z.object({
  originalName: nonEmptyStringSchema,
  mimeType: nonEmptyStringSchema,
  type: fileAttachmentTypeSchema,
  duration: z.number().int().positive().optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type RenameConversationInput = z.infer<typeof renameConversationSchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type ForwardMessageInput = z.infer<typeof forwardMessageSchema>;
export type AttachmentPresignedUrlInput = z.infer<
  typeof attachmentPresignedUrlSchema
>;

export const attachmentResponseSchema = z.object({
  id: uuidSchema,
  messageId: uuidSchema,
  type: fileAttachmentTypeSchema,
  key: nonEmptyStringSchema,
  url: z.string().url(),
  originalName: nonEmptyStringSchema,
  mimeType: nonEmptyStringSchema,
  size: z.number().int().nonnegative(),
  duration: z.number().int().positive().nullable(),
  createdAt: z.date(),
});

export const messageResponseSchema = z.object({
  id: uuidSchema,
  conversationId: uuidSchema,
  senderId: z.string().min(1).nullable(),
  body: z.string(),
  editedAt: z.date().nullable(),
  replyToId: uuidSchema.nullable(),
  quotedBody: z.string().nullable(),
  quotedSenderId: z.string().min(1).nullable(),
  forwardedFromId: uuidSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  attachments: z.array(attachmentResponseSchema),
});

export const participantResponseSchema = z.object({
  id: uuidSchema,
  conversationId: uuidSchema,
  userId: z.string().min(1),
  role: z.enum(["member", "admin"]),
  joinedAt: z.date(),
  lastReadAt: z.date().nullable(),
});

export const conversationResponseSchema = z.object({
  id: uuidSchema,
  type: z.enum(["direct", "group"]),
  name: z.string().nullable(),
  organizationId: uuidSchema.nullable(),
  createdBy: z.string().min(1).nullable(),
  archivedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const conversationWithParticipantsSchema =
  conversationResponseSchema.extend({
    participants: z.array(participantResponseSchema),
  });

export const reactionSummarySchema = z.object({
  emoji: z.string().min(1),
  count: z.number().int().nonnegative(),
  userIds: z.array(z.string().min(1)),
});

export const toggleReactionResponseSchema = z.object({
  added: z.boolean(),
  reactions: z.array(reactionSummarySchema),
});

export const attachmentUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  key: nonEmptyStringSchema,
});

export const conversationQuerySchema = z.object({
  page: paginationPageSchema,
  limit: paginationLimitSchema,
});

export const messageListQuerySchema = z.object({
  limit: paginationLimitSchema,
  before: uuidSchema.optional(),
});

export const messageSearchQuerySchema = z.object({
  q: z.string().min(1),
  limit: paginationLimitSchema,
  before: uuidSchema.optional(),
});

export const conversationsPaginatedResponseSchema = paginatedResponseSchema(
  conversationResponseSchema,
);

export type AttachmentResponse = z.infer<typeof attachmentResponseSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type ParticipantResponse = z.infer<typeof participantResponseSchema>;
export type ConversationResponse = z.infer<typeof conversationResponseSchema>;
export type ConversationWithParticipants = z.infer<
  typeof conversationWithParticipantsSchema
>;
export type ConversationsPaginatedResponse = z.infer<
  typeof conversationsPaginatedResponseSchema
>;
export type ConversationQuery = z.infer<typeof conversationQuerySchema>;
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;
export type MessageSearchQuery = z.infer<typeof messageSearchQuerySchema>;
export type ReactionSummary = z.infer<typeof reactionSummarySchema>;
export type ToggleReactionResponse = z.infer<
  typeof toggleReactionResponseSchema
>;
export type AttachmentUrlResponse = z.infer<typeof attachmentUrlResponseSchema>;

export { paginatedResponseSchema };
