"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "@/lib/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MessageWithReactions } from "./types";

interface Props {
  conversationId: string;
  replyTo?: MessageWithReactions | null;
  onClearReply?: () => void;
  onSend: (body: string, replyToId?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
}

export function MessageComposer({
  conversationId,
  replyTo,
  onClearReply,
  onSend,
  onTyping,
  disabled,
}: Props) {
  const [body, setBody] = useState("");
  const typingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [body]);

  const handleTyping = useCallback(
    (value: string) => {
      const hasText = value.trim().length > 0;
      if (hasText && !typingRef.current) {
        typingRef.current = true;
        onTyping?.(true);
      }
      if (!hasText && typingRef.current) {
        typingRef.current = false;
        onTyping?.(false);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (hasText) {
        typingTimeoutRef.current = setTimeout(() => {
          typingRef.current = false;
          onTyping?.(false);
        }, 2000);
      }
    },
    [onTyping],
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value);
    handleTyping(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = body.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, replyTo?.id);
    setBody("");
    // Stop typing indicator
    if (typingRef.current) {
      typingRef.current = false;
      onTyping?.(false);
    }
    textareaRef.current?.focus();
  }

  return (
    <div className="border-t px-4 py-3 shrink-0">
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-sm">
          <div className="flex-1 min-w-0">
            <span className="font-medium text-primary text-xs">Répondre à</span>
            <p className="truncate text-muted-foreground text-xs mt-0.5">
              {replyTo.quotedBody ?? replyTo.body}
            </p>
          </div>
          <button
            type="button"
            onClick={onClearReply}
            className="text-muted-foreground hover:text-foreground text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez un message… (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
          rows={1}
          disabled={disabled}
          className="resize-none min-h-[40px] max-h-[160px] flex-1 overflow-y-auto"
        />
        <Button
          size="icon"
          onClick={submit}
          disabled={!body.trim() || disabled}
          className="shrink-0"
        >
          <Icon icon={SendIcon} size={16} />
        </Button>
      </div>
    </div>
  );
}
