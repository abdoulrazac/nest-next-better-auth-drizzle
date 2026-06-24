"use client";

import { Icon } from "@/components/ui/icon";
import { MessagesIcon } from "@/lib/icons";
import { useEffect, useState } from "react";
import { ConnectionBanner } from "./connection-banner";
import { ConversationList } from "./conversation-list";
import { useGetConversation } from "./hooks";
import { MessageThread } from "./message-thread";
import { useChatSocket } from "./use-chat-socket";

interface ChatLayoutInnerProps {
  conversationId: string | null;
  onSelectConversation: (id: string) => void;
}

function MessageArea({
  conversationId,
  typingUsers,
  onTyping,
}: {
  conversationId: string;
  typingUsers: any[];
  onTyping: (v: boolean) => void;
}) {
  const { data: conversation, isLoading } = useGetConversation(conversationId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Conversation introuvable
        </p>
      </div>
    );
  }

  return (
    <MessageThread
      conversation={conversation}
      typingUsers={typingUsers}
      onTyping={onTyping}
    />
  );
}

export function ChatLayout({
  conversationId,
  onSelectConversation,
}: ChatLayoutInnerProps) {
  const {
    presenceMap,
    typingMap,
    joinConversation,
    leaveConversation,
    sendTyping,
    connectionStatus,
  } = useChatSocket();

  const typingUsers = conversationId ? (typingMap[conversationId] ?? []) : [];

  // Join/leave socket room when conversation changes
  const [prevConvId, setPrevConvId] = useState<string | null>(null);
  useEffect(() => {
    if (prevConvId && prevConvId !== conversationId) {
      leaveConversation(prevConvId);
    }
    if (conversationId) {
      joinConversation(conversationId);
    }
    setPrevConvId(conversationId);
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full">
      {/* Connection banner — in-flow, never overlaps content */}
      <ConnectionBanner status={connectionStatus} />

      {/* Main two-panel layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Conversation list */}
        <div className="w-72 shrink-0 flex flex-col">
          <ConversationList
            selectedId={conversationId}
            onSelect={onSelectConversation}
            presenceMap={presenceMap}
            connectionStatus={connectionStatus}
          />
        </div>

        {/* Right: Message thread */}
        <div className="flex-1 min-w-0 flex flex-col">
          {!conversationId ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <Icon
                icon={MessagesIcon}
                size={48}
                className="text-muted-foreground"
              />
              <div>
                <h3 className="font-semibold">Vos messages</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sélectionnez une conversation ou créez-en une nouvelle.
                </p>
              </div>
            </div>
          ) : (
            <MessageArea
              conversationId={conversationId}
              typingUsers={typingUsers}
              onTyping={(v) => sendTyping(conversationId, v)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
