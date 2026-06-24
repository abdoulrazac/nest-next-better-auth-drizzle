"use client";

import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessagesIcon, PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { ConversationResponse, PresenceMap } from "./types";
import { NewConversationDialog } from "./new-conversation-dialog";
import { useListConversations } from "./hooks";
import type { ConnectionStatus } from "./use-chat-socket";

// ─── WS status dot ────────────────────────────────────────────────────────────

interface DotConfig {
  dotClass: string;
  label: string;
}

const DOT_CONFIG: Record<ConnectionStatus, DotConfig> = {
  idle: {
    dotClass: "bg-muted-foreground/40",
    label: "Non connecté",
  },
  connecting: {
    dotClass: "bg-yellow-400 animate-pulse",
    label: "Connexion en cours…",
  },
  connected: {
    dotClass: "bg-green-500",
    label: "Serveur en ligne",
  },
  reconnecting: {
    dotClass: "bg-amber-400 animate-pulse",
    label: "Reconnexion en cours…",
  },
  reconnected: {
    dotClass: "bg-green-400 animate-pulse",
    label: "Connexion rétablie",
  },
  disconnected: {
    dotClass: "bg-destructive",
    label: "Serveur hors ligne",
  },
};

function WsStatusDot({ status }: { status: ConnectionStatus }) {
  const { dotClass, label } = DOT_CONFIG[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Outer ring for breathing room + click area */}
          <span className="flex items-center justify-center size-4 cursor-default">
            <span
              className={cn(
                "block size-2 rounded-full ring-2 ring-background",
                dotClass,
              )}
              aria-label={label}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={6}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  presenceMap: PresenceMap;
  connectionStatus: ConnectionStatus;
}

function conversationLabel(conv: ConversationResponse): string {
  if (conv.name) return conv.name;
  return conv.type === "direct" ? "Message direct" : "Groupe sans nom";
}

export function ConversationList({
  selectedId,
  onSelect,
  presenceMap,
  connectionStatus,
}: Props) {
  const { data, isLoading } = useListConversations({ limit: 50 });
  const conversations: ConversationResponse[] = data?.items ?? [];

  return (
    <div className="flex flex-col h-full border-r">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm">Messagerie</h2>
          <WsStatusDot status={connectionStatus} />
        </div>
        <NewConversationDialog onCreated={onSelect}>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="Nouvelle conversation"
          >
            <Icon icon={PlusIcon} size={16} />
          </Button>
        </NewConversationDialog>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-sm text-muted-foreground">Chargement...</div>
        )}

        {!isLoading && conversations.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <Icon
              icon={MessagesIcon}
              size={32}
              className="text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">
              Aucune conversation.
              <br />
              Cliquez sur <span className="font-medium text-foreground">
                +
              </span>{" "}
              pour commencer.
            </p>
          </div>
        )}

        {conversations.map((conv) => {
          const isActive = conv.id === selectedId;
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-muted/60 transition-colors",
                isActive && "bg-muted",
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                  {conversationLabel(conv).charAt(0)}
                </div>
                {conv.type === "direct" && conv.createdBy && (
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background",
                      presenceMap[conv.createdBy]
                        ? "bg-green-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">
                    {conversationLabel(conv)}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDistanceToNow(new Date(conv.updatedAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.type === "group" ? "Groupe" : "Direct"}
                  {conv.archivedAt ? " · Archivé" : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
