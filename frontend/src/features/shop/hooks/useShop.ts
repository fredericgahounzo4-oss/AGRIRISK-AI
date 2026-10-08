import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { shopApi } from '../api/shopApi';
import { getApiErrorMessage } from '@/lib/apiError';
import type { CheckoutPayload, PayoutAccount } from '../types';

/** L'intercepteur axios affiche déjà les erreurs avec message (≠ 422/500) : on évite le doublon. */
function toastError(error: unknown, fallback: string) {
  if (error instanceof AxiosError && error.response && error.response.status !== 422) {
    if (error.response.data?.message || error.response.status === 500) return;
  }
  toast.error(getApiErrorMessage(error, fallback));
}

export function useCatalog(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: ['catalog', params?.search ?? '', params?.category ?? ''],
    queryFn: () => shopApi.getCatalog(params),
  });
}

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: () => shopApi.getOrders() });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => shopApi.getOrder(id as string),
    enabled: !!id,
  });
}

function useInvalidateOrders() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['orders'] });
    qc.invalidateQueries({ queryKey: ['catalog'] });
    qc.invalidateQueries({ queryKey: ['earnings'] });
    qc.invalidateQueries({ queryKey: ['products'] });
  };
}

export function useCheckout() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => shopApi.checkout(payload),
    onSuccess: invalidate,
    onError: (e) => toastError(e, 'Impossible de créer la commande.'),
  });
}

export function usePayOrder() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (id: string) => shopApi.pay(id),
    onSuccess: invalidate,
    onError: (e) => toastError(e, 'Impossible de lancer le paiement.'),
  });
}

export function useVerifyPayment() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (id: string) => shopApi.verifyPayment(id),
    onSuccess: invalidate,
  });
}

export function useCancelOrder() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (id: string) => shopApi.cancel(id),
    onSuccess: () => { invalidate(); toast.success('Commande annulée.'); },
    onError: (e) => toastError(e, "Impossible d'annuler la commande."),
  });
}

export function useConfirmDelivery() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (id: string) => shopApi.confirmDelivery(id),
    onSuccess: () => { invalidate(); toast.success('Réception confirmée. Merci !'); },
    onError: (e) => toastError(e, 'Impossible de confirmer la réception.'),
  });
}

export function useSimulatePayment() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: 'approved' | 'declined' }) =>
      shopApi.simulatePayment(id, outcome),
    onSuccess: invalidate,
    onError: (e) => toastError(e, 'Simulation impossible.'),
  });
}

export function useSupplierOrderStatus() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'preparing' | 'shipped' | 'cancelled' }) =>
      shopApi.setSupplierStatus(id, status),
    onSuccess: invalidate,
    onError: (e) => toastError(e, 'Impossible de mettre à jour la commande.'),
  });
}

export function useEarnings() {
  return useQuery({ queryKey: ['earnings'], queryFn: () => shopApi.getEarnings() });
}

export function useSavePayoutAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayoutAccount) => shopApi.savePayoutAccount(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['earnings'] });
      toast.success('Compte de reversement enregistré.');
    },
    onError: (e) => toastError(e, "Impossible d'enregistrer le compte."),
  });
}
