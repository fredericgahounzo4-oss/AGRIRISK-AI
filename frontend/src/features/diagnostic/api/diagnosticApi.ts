import { api } from '@/services/api';
import type { DiagnosticResult, DiagnosticHistoryItem } from '../types';

export const diagnosticApi = {
  /** Envoie l'image et lance le diagnostic IA */
  analyze: async (formData: FormData): Promise<DiagnosticResult> => {
    // L'instance axios a un header par défaut Content-Type: application/json
    // (voir src/services/api.ts). Sans l'annuler explicitement ici, axios
    // convertit le FormData en JSON au lieu d'envoyer l'image (le backend
    // répond alors "la donnée soumise n'est pas un fichier").
    const { data } = await api.post<DiagnosticResult>('/diagnostics', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },

  /** Récupère le résultat d'un diagnostic par son ID */
  getById: async (id: string): Promise<DiagnosticResult> => {
    const { data } = await api.get<DiagnosticResult>(`/diagnostics/${id}`);
    return data;
  },

  /** Historique des diagnostics de l'utilisateur */
  getHistory: async (): Promise<DiagnosticHistoryItem[]> => {
    const { data } = await api.get<DiagnosticHistoryItem[]>('/diagnostics');
    return data;
  },

  /** Télécharge le rapport PDF */
  downloadReport: async (id: string): Promise<Blob> => {
    const { data } = await api.get(`/diagnostics/${id}/report`, { responseType: 'blob' });
    return data;
  },
};
