import { AxiosError } from 'axios';

/**
 * Le backend Django renvoie, en cas d'erreur 422 :
 * { "message": "Erreur de validation.", "errors": { "password": ["trop court", ...], "email": [...] } }
 * On extrait ces messages précis pour les afficher, au lieu d'un message générique.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    if (data?.errors && typeof data.errors === 'object') {
      const allMessages = Object.values(data.errors).flat();
      if (allMessages.length > 0) {
        return allMessages.join(' ');
      }
    }

    if (typeof data?.message === 'string' && data.message) {
      return data.message;
    }
  }

  return fallback;
}
