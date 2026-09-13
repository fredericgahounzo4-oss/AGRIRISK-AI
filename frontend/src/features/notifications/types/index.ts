export interface Notification {
  id: string;
  icon: string;
  title: string;
  body: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  results: Notification[];
  unread_count: number;
}
