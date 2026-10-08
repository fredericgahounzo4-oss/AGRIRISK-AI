import { api } from '@/services/api';
import type {
  CatalogProduct, CheckoutPayload, CheckoutResult, Earnings, Order, PayoutAccount,
} from '../types';

export const shopApi = {
  getCatalog: async (params?: { search?: string; category?: string; supplier_id?: string }) => {
    const { data } = await api.get<CatalogProduct[]>('/marketplace/catalog', { params });
    return data;
  },

  getOrders: async () => {
    const { data } = await api.get<Order[]>('/marketplace/orders');
    return data;
  },

  getOrder: async (id: string) => {
    const { data } = await api.get<Order>(`/marketplace/orders/${id}`);
    return data;
  },

  checkout: async (payload: CheckoutPayload) => {
    const { data } = await api.post<CheckoutResult>('/marketplace/orders', payload);
    return data;
  },

  pay: async (id: string) => {
    const { data } = await api.post<CheckoutResult>(`/marketplace/orders/${id}/pay`);
    return data;
  },

  verifyPayment: async (id: string) => {
    const { data } = await api.post<Order>(`/marketplace/orders/${id}/verify-payment`);
    return data;
  },

  cancel: async (id: string) => {
    const { data } = await api.post<Order>(`/marketplace/orders/${id}/cancel`);
    return data;
  },

  confirmDelivery: async (id: string) => {
    const { data } = await api.post<Order>(`/marketplace/orders/${id}/confirm-delivery`);
    return data;
  },

  simulatePayment: async (id: string, outcome: 'approved' | 'declined') => {
    const { data } = await api.post<Order>(`/marketplace/orders/${id}/simulate-payment`, { outcome });
    return data;
  },

  // Fournisseur
  setSupplierStatus: async (id: string, status: 'preparing' | 'shipped' | 'cancelled') => {
    const { data } = await api.post<Order>(`/marketplace/orders/${id}/status`, { status });
    return data;
  },

  getEarnings: async () => {
    const { data } = await api.get<Earnings>('/marketplace/earnings');
    return data;
  },

  savePayoutAccount: async (payload: PayoutAccount) => {
    const { data } = await api.put<PayoutAccount>('/marketplace/payout-account', payload);
    return data;
  },
};
