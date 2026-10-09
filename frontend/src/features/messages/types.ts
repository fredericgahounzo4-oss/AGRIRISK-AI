export interface Thread {
  id: string;
  other_id: string;
  other_name: string;
  other_role: 'farmer' | 'supplier' | 'admin';
  other_avatar: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  updated_at: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  content: string;
  product_id: string | null;
  product_name: string;
  is_read: boolean;
  created_at: string;
}

export interface StartThreadPayload {
  supplier_id: string;
  product_id?: string;
  content: string;
}
