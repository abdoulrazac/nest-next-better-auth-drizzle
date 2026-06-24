import { apiClient } from "@/lib/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ConversationsPaginatedResponse,
  ConversationWithParticipants,
  MessageWithReactions,
  ReactionSummary,
} from "./types";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const conversationKeys = {
  all: ["conversations"] as const,
  list: (params?: object) => [...conversationKeys.all, "list", params] as const,
  detail: (id: string) => [...conversationKeys.all, "detail", id] as const,
};

export const messageKeys = {
  all: ["messages"] as const,
  list: (conversationId: string) =>
    [...messageKeys.all, "list", conversationId] as const,
};

// ─── Conversations ────────────────────────────────────────────────────────────

export function useListConversations(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: conversationKeys.list(params),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.conversationsFindAll({
        query: params,
      });
      if (error) throw error;
      return data as unknown as ConversationsPaginatedResponse;
    },
    staleTime: 30_000,
  });
}

export function useGetConversation(id: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data, error } = await apiClient.v1.conversationsFindOne({
        path: { id: id as string },
      });
      if (error) throw error;
      return data as unknown as ConversationWithParticipants;
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      type: "direct" | "group";
      name?: string;
      participantIds: string[];
    }) => {
      const { data: res, error } = await apiClient.v1.conversationsCreate({
        body: data,
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: conversationKeys.all });
      toast.success("Conversation créée");
    },
    onError: () => toast.error("Impossible de créer la conversation"),
  });
}

export function useRenameConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data: res, error } = await apiClient.v1.conversationsRename({
        path: { id },
        body: { name },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: conversationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: conversationKeys.list() });
      toast.success("Conversation renommée");
    },
    onError: () => toast.error("Impossible de renommer la conversation"),
  });
}

export function useAddParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      const { data: res, error } =
        await apiClient.v1.conversationsAddParticipant({
          path: { id: conversationId },
          body: { userId },
        });
      if (error) throw error;
      return res;
    },
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({
        queryKey: conversationKeys.detail(conversationId),
      });
      toast.success("Participant ajouté");
    },
    onError: () => toast.error("Impossible d'ajouter le participant"),
  });
}

export function useRemoveParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      const { data: res, error } =
        await apiClient.v1.conversationsRemoveParticipant({
          path: { id: conversationId, userId },
        });
      if (error) throw error;
      return res;
    },
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({
        queryKey: conversationKeys.detail(conversationId),
      });
      toast.success("Participant retiré");
    },
    onError: () => toast.error("Impossible de retirer le participant"),
  });
}

export function useLeaveConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { data: res, error } = await apiClient.v1.conversationsLeave({
        path: { id: conversationId },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: conversationKeys.all });
      toast.success("Vous avez quitté la conversation");
    },
    onError: () => toast.error("Impossible de quitter la conversation"),
  });
}

export function useArchiveConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { data: res, error } = await apiClient.v1.conversationsArchive({
        path: { id: conversationId },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: conversationKeys.all });
      toast.success("Conversation archivée");
    },
    onError: () => toast.error("Impossible d'archiver la conversation"),
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

const MESSAGE_LIMIT = 50;

export function useListMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: messageKeys.list(conversationId ?? ""),
    queryFn: async ({ pageParam }) => {
      const { data, error } = await apiClient.v1.messagesFindAll({
        path: { id: conversationId as string },
        query: {
          limit: MESSAGE_LIMIT,
          ...(pageParam ? { before: pageParam as string } : {}),
        },
      });
      if (error) throw error;
      const messages: MessageWithReactions[] = (
        Array.isArray(data) ? data : []
      ).map((m) => ({
        ...(m as unknown as MessageWithReactions),
        reactions: [],
      }));
      return messages;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < MESSAGE_LIMIT) return undefined;
      return lastPage[lastPage.length - 1]?.id;
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      body: string;
      replyToId?: string;
      attachments?: {
        key: string;
        originalName: string;
        mimeType: string;
        size: number;
        type?: "file" | "image" | "voice";
        duration?: number;
      }[];
    }) => {
      const { data: res, error } = await apiClient.v1.messagesSend({
        path: { id: conversationId },
        body: { attachments: [], ...data },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: (newMsg) => {
      qc.setQueryData(messageKeys.list(conversationId), (old: any) => {
        if (!old) return old;
        const msgWithReactions: MessageWithReactions = {
          ...(newMsg as unknown as MessageWithReactions),
          reactions: [],
        };
        return {
          ...old,
          pages: old.pages.map((page: any[], idx: number) =>
            idx === 0 ? [msgWithReactions, ...page] : page,
          ),
        };
      });
    },
    onError: () => toast.error("Impossible d'envoyer le message"),
  });
}

export function useEditMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      messageId,
      body,
    }: {
      messageId: string;
      body: string;
    }) => {
      const { data: res, error } = await apiClient.v1.messagesEdit({
        path: { id: conversationId, msgId: messageId },
        body: { body },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: (updated) => {
      qc.setQueryData(messageKeys.list(conversationId), (old: any) =>
        patchMessage(old, updated as unknown as MessageWithReactions),
      );
    },
    onError: () => toast.error("Impossible de modifier le message"),
  });
}

export function useDeleteMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data: res, error } = await apiClient.v1.messagesRemove({
        path: { id: conversationId, msgId: messageId },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: (_, messageId) => {
      qc.setQueryData(messageKeys.list(conversationId), (old: any) =>
        patchMessageById(old, messageId, (m) => ({
          ...m,
          deletedAt: new Date() as Date,
        })),
      );
    },
    onError: () => toast.error("Impossible de supprimer le message"),
  });
}

export function useMarkAsRead(conversationId: string) {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.v1.messagesMarkAsRead({
        path: { id: conversationId },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleReaction(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: string;
    }) => {
      const { data: res, error } = await apiClient.v1.reactionsToggleReaction({
        path: { id: conversationId, msgId: messageId, emoji },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: (result, { messageId }) => {
      qc.setQueryData(messageKeys.list(conversationId), (old: any) =>
        patchMessageById(old, messageId, (m) => ({
          ...m,
          reactions: (result as any)?.reactions as ReactionSummary[],
        })),
      );
    },
    onError: () => toast.error("Impossible de réagir au message"),
  });
}

export function useForwardMessage(conversationId: string) {
  return useMutation({
    mutationFn: async ({
      messageId,
      targetConversationId,
      body,
    }: {
      messageId: string;
      targetConversationId: string;
      body?: string;
    }) => {
      const { data: res, error } = await apiClient.v1.messagesForward({
        path: { id: conversationId, msgId: messageId },
        body: { targetConversationId, body: body ?? "" },
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => toast.success("Message transféré"),
    onError: () => toast.error("Impossible de transférer le message"),
  });
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

/** Replace a full message in the infinite query cache */
export function patchMessage(old: any, updated: MessageWithReactions): any {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page: MessageWithReactions[]) =>
      page.map((m) =>
        m.id === updated.id ? { ...updated, reactions: m.reactions ?? [] } : m,
      ),
    ),
  };
}

/** Patch a message by ID using a transform function */
export function patchMessageById(
  old: any,
  messageId: string,
  transform: (m: MessageWithReactions) => MessageWithReactions,
): any {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page: MessageWithReactions[]) =>
      page.map((m) => (m.id === messageId ? transform(m) : m)),
    ),
  };
}
