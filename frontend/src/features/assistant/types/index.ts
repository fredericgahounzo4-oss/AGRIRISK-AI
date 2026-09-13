export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  last_message: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface SendMessagePayload {
  conversation_id?: string;
  content: string;
}
