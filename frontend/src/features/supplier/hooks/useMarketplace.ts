import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { marketplaceApi, type ProductWritePayload } from '../api/marketplaceApi';
import { getApiErrorMessage } from '@/lib/apiError';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => marketplaceApi.getProducts(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductWritePayload) => marketplaceApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit ajouté avec succès.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'ajout du produit."));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductWritePayload }) =>
      marketplaceApi.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit modifié avec succès.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la modification du produit.'));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketplaceApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit supprimé.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression du produit.'));
    },
  });
}

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: () => marketplaceApi.getRequests(),
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketplaceApi.acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Demande acceptée.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'acceptation de la demande."));
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketplaceApi.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Demande refusée.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors du refus de la demande.'));
    },
  });
}
