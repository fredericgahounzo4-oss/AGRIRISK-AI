export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'supplier' | 'admin';
  region?: string;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  diagnostics?: number; // for farmers
}

export interface SystemLog {
  id: string;
  action: string;
  user: string;
  type: 'auth' | 'diagnostic' | 'admin' | 'register' | 'product' | 'assistant';
  severity: 'info' | 'warning' | 'danger';
  created_at: string;
}
