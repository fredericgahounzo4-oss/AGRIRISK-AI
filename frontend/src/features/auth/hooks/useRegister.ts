import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage } from '@/lib/apiError';
import type { RegisterFarmerCredentials, RegisterSupplierCredentials } from '../types';

export function useRegisterFarmer() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: RegisterFarmerCredentials) => authApi.registerFarmer(credentials),
    onSuccess: ({ token, user }) => {
      login(token, user);
      toast.success('Compte créé avec succès ! Bienvenue 🌱');
      navigate('/app/tableau-de-bord', { replace: true });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'inscription. Vérifiez vos informations."),
        { duration: 6000 }
      );
    },
  });
}

export function useRegisterSupplier() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: RegisterSupplierCredentials) => authApi.registerSupplier(credentials),
    onSuccess: ({ token, user }) => {
      login(token, user);
      toast.success('Compte fournisseur créé ! Bienvenue 🚀');
      navigate('/fournisseur/tableau-de-bord', { replace: true });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'inscription. Vérifiez vos informations."),
        { duration: 6000 }
      );
    },
  });
}
