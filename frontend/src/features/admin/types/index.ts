export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'supplier' | 'admin';
  region?: string;
  status: 'active' | 'suspended' | 'pending' | 'rejected';
  created_at: string;
  diagnostics?: number; // for farmers
}

export interface SystemLog {
  id: string;
  action: string;
  user: string;
  type: 'auth' | 'diagnostic' | 'admin' | 'register' | 'product' | 'assistant' | 'request';
  severity: 'info' | 'warning' | 'danger';
  created_at: string;
}

export interface MonthlyStat {
  month: string;
  diagnostics: number;
  ai_messages: number;
  new_users: number;
}

export interface AdminStats {
  total_users: number;
  farmers: number;
  suppliers: number;
  total_diagnostics: number;
  recent_logs: SystemLog[];
  monthly_stats: MonthlyStat[];
}
