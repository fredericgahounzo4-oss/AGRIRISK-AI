import { api } from '@/services/api';
import type { Product, ProductRequest } from '../types';

export interface ProductWritePayload {
  name?: string;
  category?: string;
  price?: number;
  stock?: number;
  status?: Product['status'];
  sku?: string;
  image?: File;
}

function toFormData(payload: ProductWritePayload): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as string | Blob);
    }
  });
  return formData;
}

export const marketplaceApi = {
  getProducts: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/marketplace/products');
    return data;
  },

  createProduct: async (payload: ProductWritePayload): Promise<Product> => {
    // Content-Type: undefined annule le défaut JSON de l'instance axios,
    // indispensable pour que le FormData soit envoyé tel quel (voir
    // src/features/auth/api/profileApi.ts pour le détail du problème).
    const { data } = await api.post<Product>('/marketplace/products', toFormData(payload), {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },

  updateProduct: async (id: string, payload: ProductWritePayload): Promise<Product> => {
    // JSON quand il n'y a pas d'image (plus simple et fiable), multipart sinon.
    if (payload.image) {
      const { data } = await api.patch<Product>(`/marketplace/products/${id}`, toFormData(payload), {
        headers: { 'Content-Type': undefined },
      });
      return data;
    }
    const { data } = await api.patch<Product>(`/marketplace/products/${id}`, payload);
    return data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/marketplace/products/${id}`);
  },

  getRequests: async (): Promise<ProductRequest[]> => {
    const { data } = await api.get<ProductRequest[]>('/marketplace/requests');
    return data;
  },

  acceptRequest: async (id: string): Promise<ProductRequest> => {
    const { data } = await api.post<ProductRequest>(`/marketplace/requests/${id}/accept`);
    return data;
  },

  rejectRequest: async (id: string): Promise<ProductRequest> => {
    const { data } = await api.post<ProductRequest>(`/marketplace/requests/${id}/reject`);
    return data;
  },
};
