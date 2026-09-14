import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '@/lib/apiError';

export function useAdminStats() {
  return useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.getStats });
}

export function useAdminUsers() {
  return useQuery({ queryKey: ['admin', 'users'], queryFn: adminApi.getUsers });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.toggleUserStatus(id),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(
        user.status === 'active' ? `${user.name} a été réactivé.` : `${user.name} a été suspendu.`
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Erreur lors de la mise à jour.')),
  });
}

export function useAdminSuppliers() {
  return useQuery({ queryKey: ['admin', 'suppliers'], queryFn: adminApi.getSuppliers });
}

export function useValidateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.validateSupplier(id),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
      toast.success(`${user.name} a été validé.`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Erreur lors de la validation.')),
  });
}

export function useRejectSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.rejectSupplier(id),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
      toast.success(`${user.name} a été refusé.`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Erreur lors du refus.')),
  });
}

export function useAdminProducts() {
  return useQuery({ queryKey: ['admin', 'products'], queryFn: adminApi.getProducts });
}

export function useAdminDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Produit retiré de la plateforme.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Erreur lors du retrait.')),
  });
}

export function useAdminDiagnostics() {
  return useQuery({ queryKey: ['admin', 'diagnostics'], queryFn: adminApi.getDiagnostics });
}

export function useAdminLogs() {
  return useQuery({ queryKey: ['admin', 'logs'], queryFn: adminApi.getLogs });
}
