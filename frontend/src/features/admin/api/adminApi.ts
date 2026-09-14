import { api } from '@/services/api';
import type { AdminUser, AdminStats, SystemLog } from '../types';
import type { DiagnosticHistoryItem } from '@/features/diagnostic/types';
import type { Product } from '@/features/supplier/types';

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<AdminStats>('/admin/stats');
    return data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const { data } = await api.get<AdminUser[]>('/admin/users');
    return data;
  },

  toggleUserStatus: async (id: string): Promise<AdminUser> => {
    const { data } = await api.post<AdminUser>(`/admin/users/${id}/toggle`);
    return data;
  },

  getSuppliers: async (): Promise<AdminUser[]> => {
    const { data } = await api.get<AdminUser[]>('/admin/suppliers');
    return data;
  },

  validateSupplier: async (id: string): Promise<AdminUser> => {
    const { data } = await api.post<AdminUser>(`/admin/suppliers/${id}/validate`);
    return data;
  },

  rejectSupplier: async (id: string): Promise<AdminUser> => {
    const { data } = await api.post<AdminUser>(`/admin/suppliers/${id}/reject`);
    return data;
  },

  getProducts: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/admin/products');
    return data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },

  getDiagnostics: async (): Promise<DiagnosticHistoryItem[]> => {
    const { data } = await api.get<DiagnosticHistoryItem[]>('/admin/diagnostics');
    return data;
  },

  getLogs: async (): Promise<SystemLog[]> => {
    const { data } = await api.get<SystemLog[]>('/admin/logs');
    return data;
  },
};
