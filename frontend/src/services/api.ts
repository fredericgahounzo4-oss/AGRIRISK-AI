import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Les endpoints IA (diagnostic, assistant) peuvent retenter plusieurs
  // fois côté serveur en cas de surcharge Gemini (jusqu'à ~120s au total,
  // cf. le timeout Gunicorn). Un timeout frontend trop court coupait la
  // requête et affichait une fausse "erreur réseau" alors que le serveur
  // était encore en train de travailler.
  timeout: 130000,
});

// Injecte le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agririsk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      localStorage.removeItem('agririsk_token');
      window.location.href = '/connexion';
    } else if (status === 422) {
      // Erreurs de validation — gérées par chaque feature
    } else if (status === 500) {
      toast.error('Erreur serveur. Réessayez plus tard.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error("Le serveur met trop de temps à répondre. Réessayez dans quelques instants.");
    } else if (!error.response) {
      toast.error('Connexion impossible. Vérifiez votre réseau.');
    } else if (message) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);
