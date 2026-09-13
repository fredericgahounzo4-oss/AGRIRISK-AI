import { api } from '@/services/api';
import type { Supplier } from '../types';

export const suppliersApi = {
  getAll: async (params?: { category?: string; lat?: number; lng?: number }): Promise<Supplier[]> => {
    const { data } = await api.get<Supplier[]>('/suppliers', { params });
    return data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const { data } = await api.get<Supplier>(`/suppliers/${id}`);
    return data;
  },
};
