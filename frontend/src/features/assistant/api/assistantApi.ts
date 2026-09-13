import { api } from '@/services/api';
import type { Conversation, Message, SendMessagePayload } from '../types';

export const assistantApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<Conversation[]>('/conversations');
    return data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(`/conversations/${conversationId}/messages`);
    return data;
  },

  sendMessage: async (payload: SendMessagePayload): Promise<{ conversation: Conversation; message: Message }> => {
    const { data } = await api.post(`/conversations/messages`, payload);
    return data;
  },

  createConversation: async (): Promise<Conversation> => {
    const { data } = await api.post<Conversation>('/conversations');
    return data;
  },
};
