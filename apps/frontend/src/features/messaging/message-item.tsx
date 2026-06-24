"use client";

import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useStore } from "@nanostores/react";
import { EditIcon, MoreVerticalIcon, TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import type { MessageWithReactions, ReactionSummary } from "./types";

// Simple inline editor
function InlineEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (body: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="mt-1 space-y-1">
      <textarea
        className="w-full rounded border px-2 py-1 text-sm resize-none bg-background"
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSave(value.trim());
          }
          if (e.key === "Escape") onCancel();
        }}
        autoFocus
      />
      <div className="flex gap-2 text-xs">
        <button
          className="text-primary hover:underline"
          onClick={() => onSave(value.trim())}
        >
          Enregistrer
        </button>
        <button
          className="text-muted-foreground hover:underline"
          onClick={onCancel}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// Reaction pill
function ReactionPill({
  reaction,
  currentUserId,
  onToggle,
}: {
  reaction: ReactionSummary;
  currentUserId: string | undefined;
  onToggle: (emoji: string) => void;
}) {
  const reacted = currentUserId
    ? reaction.userIds.includes(currentUserId)
    : false;
  return (
    <button
      onClick={() => onToggle(reaction.emoji)}
      className={cn(
        "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
        reacted
          ? "border-primary bg-primary/10 text-primary"
          : "hover:bg-muted",
      )}
    >
      <span>{reaction.emoji}</span>
      <span>{reaction.count}</span>
    </button>
  );
}

// Common emojis for quick reactions
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

interface Props {
  message: MessageWithReactions;
  onReply?: (message: MessageWithReactions) => void;
  onEdit?: (messageId: string, body: string) => void;
  onDelete?: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}

export function MessageItem({
  message,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}: Props) {
  const session = useStore(authClient.useSession);
  const currentUserId = session.data?.user?.id;
  const isOwn = message.senderId === currentUserId;
  const [editing, setEditing] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const isDeleted = !!message.deletedAt;

  const canEdit =
    isOwn &&
    !isDeleted &&
    Date.now() - new Date(message.createdAt).getTime() < 15 * 60 * 1000;

  function handleSaveEdit(body: string) {
    if (body) {
      onEdit?.(message.id, body);
    }
    setEditing(false);
  }

  return (
    <div
      className={cn(
        "group relative flex items-start gap-2 px-4 py-1.5 hover:bg-muted/40 transition-colors",
        isOwn && "flex-row-reverse",
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
          {(message.senderId ?? "?").charAt(0)}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isOwn && "items-end flex flex-col")}>
        {/* Header */}
        <div
          className={cn(
            "flex items-baseline gap-2",
            isOwn && "flex-row-reverse",
          )}
        >
          <span className="text-xs font-semibold truncate max-w-[140px]">
            {isOwn ? "Vous" : (message.senderId ?? "Inconnu")}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {format(new Date(message.createdAt), "HH:mm", { locale: fr })}
          </span>
          {message.editedAt && (
            <span className="text-[10px] text-muted-foreground italic">
              (modifié)
            </span>
          )}
        </div>

        {/* Reply preview */}
        {message.quotedBody && (
          <div className="mt-0.5 mb-1 border-l-2 border-primary/40 pl-2 text-xs text-muted-foreground line-clamp-2">
            {message.quotedBody}
          </div>
        )}

        {/* Body / deleted */}
        {isDeleted ? (
          <p className="text-sm italic text-muted-foreground">
            Message supprimé
          </p>
        ) : editing ? (
          <InlineEditor
            initial={message.body}
            onSave={handleSaveEdit}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <p
            className={cn(
              "text-sm whitespace-pre-wrap break-words rounded-2xl px-3 py-1.5 inline-block max-w-[70%]",
              isOwn
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-muted rounded-tl-none",
            )}
          >
            {message.body}
          </p>
        )}

        {/* Forwarded indicator */}
        {message.forwardedFromId && !isDeleted && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            ↪ Transféré
          </p>
        )}

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div
            className={cn("flex flex-wrap gap-1 mt-1", isOwn && "justify-end")}
          >
            {message.reactions.map((r) => (
              <ReactionPill
                key={r.emoji}
                reaction={r}
                currentUserId={currentUserId}
                onToggle={(emoji) => onToggleReaction?.(message.id, emoji)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions — shown on hover */}
      {!isDeleted && (
        <div
          className={cn(
            "absolute top-1 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-background border rounded-md shadow-sm p-0.5 transition-opacity",
            isOwn ? "left-2" : "right-2",
          )}
        >
          {/* Quick reactions */}
          <div className="relative">
            <button
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              onClick={() => setShowReactionPicker((v) => !v)}
              title="Réagir"
            >
              😀
            </button>
            {showReactionPicker && (
              <div className="absolute bottom-full mb-1 left-0 flex gap-1 bg-background border rounded-md shadow-md p-1 z-10">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    className="text-sm hover:scale-125 transition-transform p-0.5"
                    onClick={() => {
                      onToggleReaction?.(message.id, emoji);
                      setShowReactionPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reply */}
          <button
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
            onClick={() => onReply?.(message)}
            title="Répondre"
          >
            ↩
          </button>

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6">
                <Icon icon={MoreVerticalIcon} size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? "start" : "end"}>
              {canEdit && (
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Icon icon={EditIcon} size={14} className="mr-2" />
                  Modifier
                </DropdownMenuItem>
              )}
              {canEdit && <DropdownMenuSeparator />}
              {isOwn && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete?.(message.id)}
                >
                  <Icon icon={TrashIcon} size={14} className="mr-2" />
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
