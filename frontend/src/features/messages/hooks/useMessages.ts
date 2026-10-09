import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../api/messagesApi';
import { useAuthStore } from '@/features/auth/store/authStore';

/** Rafraîchissement régulier = messagerie quasi temps réel sans WebSocket. */
const THREADS_REFRESH_MS = 10_000;
const THREAD_REFRESH_MS = 5_000;

export function useThreads() {
  return useQuery({
    queryKey: ['threads'],
    queryFn: messagesApi.getThreads,
    refetchInterval: THREADS_REFRESH_MS,
  });
}

export function useThreadMessages(threadId: string | null) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      const res = await messagesApi.getThread(threadId as string);
      // Le serveur marque les messages comme lus : on met à jour les pastilles.
      qc.invalidateQueries({ queryKey: ['threads'] });
      qc.invalidateQueries({ queryKey: ['messages-unread'] });
      return res;
    },
    enabled: !!threadId,
    refetchInterval: THREAD_REFRESH_MS,
  });
}

export function useUnreadMessages() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['messages-unread'],
    queryFn: messagesApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: THREADS_REFRESH_MS,
  });
}

export function useSendDirectMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      messagesApi.send(threadId, content),
    onSuccess: (_, { threadId }) => {
      qc.invalidateQueries({ queryKey: ['thread', threadId] });
      qc.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

export function useStartThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.startThread,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}
