import { api } from '@/services/api';
import type { NotificationListResponse, Notification } from '../types';

export const notificationsApi = {
  list: async (): Promise<NotificationListResponse> => {
    const { data } = await api.get<NotificationListResponse>('/notifications');
    return data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const { data } = await api.post<Notification>(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },
};
