"use client";

import { authClient } from "@/lib/auth-client";
import { useStore } from "@nanostores/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { messageKeys, patchMessage, patchMessageById } from "./hooks";
import type {
  MessageWithReactions,
  PresenceMap,
  ReactionSummary,
  TypingMap,
  TypingUser,
} from "./types";

const WS_URL =
  (typeof window !== "undefined"
    ? (window as any).__NEXT_PUBLIC_WS_URL__
    : undefined) ??
  process.env.NEXT_PUBLIC_WS_URL ??
  "http://localhost:3001";

const HEARTBEAT_INTERVAL = 20_000; // 20 s — backend presence TTL is 35 s

export type ConnectionStatus =
  | "idle" // no token yet, socket not started
  | "connecting" // socket created, first connect pending
  | "connected" // successfully connected
  | "reconnecting" // lost connection, socket.io auto-retrying
  | "reconnected" // just came back — transient (auto-clears after 2 s)
  | "disconnected"; // gave up after max reconnection attempts

interface UseChatSocketReturn {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  presenceMap: PresenceMap;
  typingMap: TypingMap;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
}

export function useChatSocket(): UseChatSocketReturn {
  const session = useStore(authClient.useSession);
  const token = session.data?.session?.token;
  const qc = useQueryClient();

  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [presenceMap, setPresenceMap] = useState<PresenceMap>({});
  const [typingMap, setTypingMap] = useState<TypingMap>({});
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const typingTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    if (!token) {
      setConnectionStatus("idle");
      return;
    }

    setConnectionStatus("connecting");

    const socket = io(WS_URL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    // ── Connection lifecycle ─────────────────────────────────────────────────

    socket.on("connect", () => {
      // If we were reconnecting, show a brief "reconnected" flash
      setConnectionStatus((prev) => {
        if (prev === "reconnecting") {
          reconnectedTimerRef.current = setTimeout(
            () => setConnectionStatus("connected"),
            2500,
          );
          return "reconnected";
        }
        return "connected";
      });
      // Start heartbeat
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      heartbeatRef.current = setInterval(() => {
        socket.emit("heartbeat");
      }, HEARTBEAT_INTERVAL);
    });

    socket.on("disconnect", (reason) => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      // If the server forcefully closed the connection (e.g. auth failure),
      // don't show "reconnecting" — show "disconnected" immediately.
      if (reason === "io server disconnect" || reason === "transport close") {
        setConnectionStatus("reconnecting");
      } else {
        setConnectionStatus("reconnecting");
      }
    });

    socket.io.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect_failed", () => {
      setConnectionStatus("disconnected");
    });

    // ── Presence ─────────────────────────────────────────────────────────────

    socket.on("presence:online", ({ userId }: { userId: string }) => {
      setPresenceMap((prev) => ({ ...prev, [userId]: true }));
    });

    socket.on("presence:offline", ({ userId }: { userId: string }) => {
      setPresenceMap((prev) => ({ ...prev, [userId]: false }));
    });

    // ── Typing ───────────────────────────────────────────────────────────────

    socket.on(
      "typing",
      ({
        userId,
        userName,
        isTyping,
        conversationId,
      }: TypingUser & { isTyping: boolean; conversationId: string }) => {
        const key = `${conversationId}:${userId}`;

        // Clear existing auto-clear timeout for this user+conversation
        if (typingTimeoutsRef.current[key]) {
          clearTimeout(typingTimeoutsRef.current[key]);
        }

        setTypingMap((prev) => {
          const current = prev[conversationId] ?? [];
          if (isTyping) {
            const alreadyThere = current.some((u) => u.userId === userId);
            return {
              ...prev,
              [conversationId]: alreadyThere
                ? current
                : [...current, { userId, userName }],
            };
          } else {
            return {
              ...prev,
              [conversationId]: current.filter((u) => u.userId !== userId),
            };
          }
        });

        // Auto-clear after 4 s in case `typing:false` never arrives
        if (isTyping) {
          typingTimeoutsRef.current[key] = setTimeout(() => {
            setTypingMap((prev) => ({
              ...prev,
              [conversationId]: (prev[conversationId] ?? []).filter(
                (u) => u.userId !== userId,
              ),
            }));
          }, 4000);
        }
      },
    );

    // ── Message events ───────────────────────────────────────────────────────

    socket.on("message:new", (message: MessageWithReactions) => {
      const convId = message.conversationId;
      qc.setQueryData(messageKeys.list(convId), (old: any) => {
        if (!old) return old;
        const msgWithReactions = {
          ...message,
          reactions: message.reactions ?? [],
        };
        // Avoid duplicates
        const firstPage: MessageWithReactions[] = old.pages[0] ?? [];
        if (firstPage.some((m: MessageWithReactions) => m.id === message.id))
          return old;
        return {
          ...old,
          pages: [[msgWithReactions, ...firstPage], ...old.pages.slice(1)],
        };
      });
    });

    socket.on("message:updated", (message: MessageWithReactions) => {
      qc.setQueryData(messageKeys.list(message.conversationId), (old: any) =>
        patchMessage(old, message),
      );
    });

    socket.on(
      "message:deleted",
      ({
        messageId,
        conversationId,
      }: {
        messageId: string;
        conversationId: string;
      }) => {
        qc.setQueryData(messageKeys.list(conversationId), (old: any) =>
          patchMessageById(old, messageId, (m) => ({
            ...m,
            deletedAt: new Date() as Date,
          })),
        );
      },
    );

    socket.on(
      "message:reaction",
      ({
        messageId,
        conversationId,
        reactions,
      }: {
        messageId: string;
        conversationId: string;
        emoji: string;
        added: boolean;
        reactions: ReactionSummary[];
      }) => {
        qc.setQueryData(messageKeys.list(conversationId), (old: any) =>
          patchMessageById(old, messageId, (m) => ({ ...m, reactions })),
        );
      },
    );

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (reconnectedTimerRef.current)
        clearTimeout(reconnectedTimerRef.current);
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit("join", conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socketRef.current?.emit("leave", conversationId);
  };

  const sendTyping = (conversationId: string, isTyping: boolean) => {
    socketRef.current?.emit("typing", { conversationId, isTyping });
  };

  return {
    socket: socketRef.current,
    connectionStatus,
    isConnected:
      connectionStatus === "connected" || connectionStatus === "reconnected",
    presenceMap,
    typingMap,
    joinConversation,
    leaveConversation,
    sendTyping,
  };
}
