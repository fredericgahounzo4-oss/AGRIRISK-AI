import { api } from '@/services/api';
import type { User } from '../types';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  region?: string;
  culture?: string;
  company?: string;
  category?: string;
  description?: string;
  language?: string;
  country?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const profileApi = {
  update: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await api.patch<User>('/auth/profile', payload);
    return data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    // L'instance axios a un header par défaut Content-Type: application/json
    // (voir src/services/api.ts). Sans l'annuler explicitement ici, axios
    // convertit le FormData en JSON au lieu de l'envoyer comme fichier
    // (erreur backend "La donnée soumise n'est pas un fichier").
    const { data } = await api.post<User>('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string; token: string }> => {
    const { data } = await api.post('/auth/change-password', payload);
    return data;
  },
};
