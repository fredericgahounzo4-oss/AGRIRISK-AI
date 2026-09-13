export type UserRole = 'farmer' | 'supplier' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string;
  region?: string;
  culture?: string;   // farmer-specific
  company?: string;   // supplier-specific
  category?: string;  // supplier-specific
  description?: string; // supplier-specific
  language?: string;
  country?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterFarmerCredentials {
  name: string;
  email: string;
  phone: string;
  region: string;
  culture: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterSupplierCredentials {
  company: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  category: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}
