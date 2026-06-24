"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SpinnerIcon } from "@/lib/icons";
import { useEffect, useRef } from "react";
import {
  useDeleteMessage,
  useEditMessage,
  useListMessages,
  useMarkAsRead,
  useSendMessage,
  useToggleReaction,
} from "./hooks";
import { MessageComposer } from "./message-composer";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";
import type { MessageWithReactions, TypingUser } from "./types";
import type { ConversationWithParticipants } from "./types";

interface Props {
  conversation: ConversationWithParticipants;
  typingUsers: TypingUser[];
  onTyping: (isTyping: boolean) => void;
}

export function MessageThread({ conversation, typingUsers, onTyping }: Props) {
  const conversationId = conversation.id;
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useListMessages(conversationId);

  const { mutate: send, isPending: isSending } = useSendMessage(conversationId);
  const { mutate: edit } = useEditMessage(conversationId);
  const { mutate: deleteMsg } = useDeleteMessage(conversationId);
  const { mutate: toggleReaction } = useToggleReaction(conversationId);
  const { mutate: markAsRead } = useMarkAsRead(conversationId);

  // Flatten pages: each page is DESC, combine then reverse to get ASC (chronological)
  const allMessages: MessageWithReactions[] = [
    ...(data?.pages.flatMap((p) => p) ?? []),
  ].reverse();

  // Scroll to bottom on first load and on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  // Mark conversation as read when viewed
  useEffect(() => {
    markAsRead(undefined as any);
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track reply-to state
  const replyToRef = useRef<MessageWithReactions | null>(null);

  function handleSend(body: string, replyToId?: string) {
    send({ body, replyToId });
    replyToRef.current = null;
  }

  function handleReply(message: MessageWithReactions) {
    replyToRef.current = message;
    // Trigger re-render by sending a synthetic event — we'll use a state instead
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation title */}
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
          {(conversation.name ?? "M").charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-sm">
            {conversation.name ??
              (conversation.type === "direct" ? "Message direct" : "Groupe")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {conversation.participants.length} participant
            {conversation.participants.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Message list */}
      <div ref={containerRef} className="flex-1 overflow-y-auto py-2">
        {/* Load more button */}
        {hasNextPage && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Icon
                  icon={SpinnerIcon}
                  size={14}
                  className="animate-spin mr-1"
                />
              ) : null}
              Charger plus de messages
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <Icon
              icon={SpinnerIcon}
              size={24}
              className="animate-spin text-muted-foreground"
            />
          </div>
        )}

        {!isLoading && allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-sm text-muted-foreground">
              Aucun message. Soyez le premier à écrire !
            </p>
          </div>
        )}

        {allMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onReply={handleReply}
            onEdit={(messageId, body) => edit({ messageId, body })}
            onDelete={(messageId) => deleteMsg(messageId)}
            onToggleReaction={(messageId, emoji) =>
              toggleReaction({ messageId, emoji })
            }
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <TypingIndicator users={typingUsers} />

      {/* Composer */}
      <MessageComposer
        conversationId={conversationId}
        onSend={handleSend}
        onTyping={(isTyping) => onTyping(isTyping)}
        disabled={isSending}
      />
    </div>
  );
}
