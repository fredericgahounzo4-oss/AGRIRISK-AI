import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials } from '../types';

export function useLogin() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: ({ token, user }) => {
      login(token, user);
      toast.success(`Bienvenue, ${user.name} !`);
      // Redirect based on role
      if (user.role === 'admin')    navigate('/admin/tableau-de-bord', { replace: true });
      else if (user.role === 'supplier') navigate('/fournisseur/tableau-de-bord', { replace: true });
      else navigate('/app/tableau-de-bord', { replace: true });
    },
    onError: () => {
      toast.error('Email ou mot de passe incorrect.');
    },
  });
}
