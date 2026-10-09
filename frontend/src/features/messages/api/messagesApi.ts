import { api } from '@/services/api';
import type { DirectMessage, StartThreadPayload, Thread } from '../types';

export const messagesApi = {
  getThreads: async (): Promise<Thread[]> => {
    const { data } = await api.get<Thread[]>('/messages/threads');
    return data;
  },

  getThread: async (id: string): Promise<{ thread: Thread; messages: DirectMessage[] }> => {
    const { data } = await api.get(`/messages/threads/${id}`);
    return data;
  },

  startThread: async (payload: StartThreadPayload): Promise<{ thread: Thread; message: DirectMessage }> => {
    const { data } = await api.post('/messages/threads', payload);
    return data;
  },

  send: async (threadId: string, content: string): Promise<DirectMessage> => {
    const { data } = await api.post<DirectMessage>(`/messages/threads/${threadId}`, { content });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<{ count: number }>('/messages/unread');
    return data.count;
  },
};
