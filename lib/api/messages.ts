import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { normalizeKeys } from './normalize';

export interface MessageThread {
  id: string;
  websiteId?: string | null;
  requestId?: string | null;
  updatedAt: string;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  lastMessageSenderId?: string | null;
  unreadCount: number;
  participants: Array<{ id: string; name: string; username: string; avatar?: string; role?: string }>;
  website?: { id: string; name: string; slug: string; thumbnail?: string; shortDescription?: string; status?: string } | null;
  request?: { id: string; title: string; status: string } | null;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  timestamp?: string;
  message?: string;
};

export const messageKeys = {
  all: ['messages'] as const,
  threads: () => [...messageKeys.all, 'threads'] as const,
  threadMessages: (threadId: string) => [...messageKeys.all, 'thread', threadId] as const,
};

export const useMessageThreads = () => {
  return useQuery({
    queryKey: messageKeys.threads(),
    queryFn: async () => {
      const response = await apiClient.get<ApiEnvelope<{ threads: unknown[] }>>('/messages/threads');
      return (response.data.data.threads || []).map((t) => normalizeKeys<MessageThread>(t));
    },
    staleTime: 15 * 1000,
  });
};

export const useThreadMessages = (threadId: string, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: messageKeys.threadMessages(threadId),
    queryFn: async () => {
      const response = await apiClient.get<ApiEnvelope<{ messages: unknown[] }>>(
        `/messages/threads/${threadId}/messages`
      );
      return (response.data.data.messages || []).map((m) => normalizeKeys<Message>(m));
    },
    enabled: !!threadId && enabled,
  });
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { otherUserId: string; websiteId?: string; requestId?: string }) => {
      const response = await apiClient.post<ApiEnvelope<{ threadId: string }>>('/messages/threads', payload);
      return response.data.data.threadId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { threadId: string; content: string }) => {
      const response = await apiClient.post<ApiEnvelope<{ message: unknown }>>(
        `/messages/threads/${payload.threadId}/messages`,
        { content: payload.content }
      );
      return normalizeKeys<Message>(response.data.data.message);
    },
    onSuccess: (_m, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.threadMessages(variables.threadId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
    },
  });
};

export const useMarkThreadRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      await apiClient.post<ApiEnvelope<{ threadId: string }>>(`/messages/threads/${threadId}/read`, {});
      return threadId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
    },
  });
};
