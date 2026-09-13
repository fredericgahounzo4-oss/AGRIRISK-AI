import { api } from '@/services/api';
import { delay } from '@/services/mockDelay';
import { MOCK_USERS } from '@/services/mockData';
import type { AuthResponse, LoginCredentials, RegisterCredentials, RegisterFarmerCredentials, RegisterSupplierCredentials } from '../types';

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (IS_MOCK) {
      const user = MOCK_USERS[credentials.email];
      if (!user || credentials.password.length < 4) {
        await delay(null, 700);
        const err = { response: { status: 401, data: { message: 'Email ou mot de passe incorrect.' } } };
        throw err;
      }
      return delay({ token: `mock-jwt-${user.role}-${Date.now()}`, user }, 900);
    }
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    if (IS_MOCK) {
      const user = {
        id: `user-${Date.now()}`,
        name: credentials.name,
        email: credentials.email,
        role: 'farmer' as const,
        created_at: new Date().toISOString(),
      };
      return delay({ token: `mock-jwt-farmer-${Date.now()}`, user }, 1000);
    }
    const { data } = await api.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  registerFarmer: async (credentials: RegisterFarmerCredentials): Promise<AuthResponse> => {
    if (IS_MOCK) {
      const user = {
        id: `farmer-${Date.now()}`,
        name: credentials.name,
        email: credentials.email,
        role: 'farmer' as const,
        phone: credentials.phone,
        region: credentials.region,
        culture: credentials.culture,
        created_at: new Date().toISOString(),
      };
      return delay({ token: `mock-jwt-farmer-${Date.now()}`, user }, 1000);
    }
    const { data } = await api.post<AuthResponse>('/auth/register/farmer', credentials);
    return data;
  },

  registerSupplier: async (credentials: RegisterSupplierCredentials): Promise<AuthResponse> => {
    if (IS_MOCK) {
      const user = {
        id: `supplier-${Date.now()}`,
        name: credentials.name,
        email: credentials.email,
        role: 'supplier' as const,
        phone: credentials.phone,
        region: credentials.region,
        company: credentials.company,
        category: credentials.category,
        created_at: new Date().toISOString(),
      };
      return delay({ token: `mock-jwt-supplier-${Date.now()}`, user }, 1000);
    }
    const { data } = await api.post<AuthResponse>('/auth/register/supplier', credentials);
    return data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    if (IS_MOCK) { await delay(null, 800); return; }
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string, password_confirmation: string): Promise<void> => {
    if (IS_MOCK) { await delay(null, 800); return; }
    await api.post('/auth/reset-password', { token, password, password_confirmation });
  },

  logout: async (): Promise<void> => {
    if (IS_MOCK) { await delay(null, 300); return; }
    await api.post('/auth/logout');
  },

  me: async () => {
    if (IS_MOCK) { return delay(null, 300); }
    const { data } = await api.get('/auth/me');
    return data;
  },
};
