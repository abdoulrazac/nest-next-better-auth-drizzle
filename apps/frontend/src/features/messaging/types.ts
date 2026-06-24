import type {
  AttachmentResponse,
  AttachmentUrlResponse,
  ConversationResponse,
  ConversationWithParticipants,
  ConversationsPaginatedResponse,
  MessageResponse,
  ParticipantResponse,
  ReactionSummary,
  ToggleReactionResponse,
} from "@repo/validators/messages";

export type {
  AttachmentResponse,
  AttachmentUrlResponse,
  ConversationResponse,
  ConversationWithParticipants,
  ConversationsPaginatedResponse,
  MessageResponse,
  ParticipantResponse,
  ReactionSummary,
  ToggleReactionResponse,
};

/** MessageResponse enriched with live reactions managed on the client */
export interface MessageWithReactions extends MessageResponse {
  reactions: ReactionSummary[];
}

/** Who is currently typing in a given conversation */
export interface TypingUser {
  userId: string;
  userName: string;
}

/** userId → isOnline map */
export type PresenceMap = Record<string, boolean>;

/** conversationId → list of users currently typing */
export type TypingMap = Record<string, TypingUser[]>;

export type ConversationType = "direct" | "group";
