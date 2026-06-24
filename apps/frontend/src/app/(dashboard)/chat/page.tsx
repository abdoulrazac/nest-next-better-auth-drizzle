"use client";

import { BasePage } from "@/components/layout/base-page";
import { ChatLayout } from "@/features/messaging/chat-layout";
import { useQueryState } from "nuqs";

export default function ChatPage() {
  const [conversationId, setConversationId] = useQueryState("c");

  return (
    <BasePage
      breadcrumbs={[{ title: "Messagerie" }]}
      // Override the default max-w / padding so the Slack-style layout fills
      // the full available width and height below the BasePage header (h-16).
      className="max-w-full p-0 mt-0 flex-1 flex flex-col overflow-hidden"
    >
      <ChatLayout
        conversationId={conversationId}
        onSelectConversation={setConversationId}
      />
    </BasePage>
  );
}
