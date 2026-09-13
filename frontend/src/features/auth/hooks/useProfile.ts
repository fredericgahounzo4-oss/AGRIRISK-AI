import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { profileApi, type UpdateProfilePayload, type ChangePasswordPayload } from '../api/profileApi';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage } from '@/lib/apiError';

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.update(payload),
    onSuccess: (user) => {
      setUser(user);
      toast.success('Profil mis à jour avec succès.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la mise à jour du profil.'));
    },
  });
}

export function useUploadAvatar() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (user) => {
      setUser(user);
      toast.success('Photo de profil mise à jour.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'envoi de la photo."));
    },
  });
}

export function useChangePassword() {
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => profileApi.changePassword(payload),
    onSuccess: (data) => {
      // Le backend régénère le token après un changement de mot de passe :
      // on le remplace pour ne pas déconnecter l'utilisateur.
      if (user) login(data.token, user);
      toast.success(data.message || 'Mot de passe modifié avec succès.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors du changement de mot de passe.'));
    },
  });
}
