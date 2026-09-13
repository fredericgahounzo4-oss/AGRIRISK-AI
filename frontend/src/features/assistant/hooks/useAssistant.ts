import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistantApi } from '../api/assistantApi';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => assistantApi.getConversations(),
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => assistantApi.getMessages(conversationId!),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assistantApi.sendMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
