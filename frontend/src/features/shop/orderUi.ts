import type { Order, OrderStatus } from './types';

export const formatFcfa = (amount: number) =>
  `${Math.round(amount).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ')} FCFA`;

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export const orderStatusStyle: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-blue-50 text-blue-700',
  preparing: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export const operatorLabel: Record<string, string> = {
  tmoney: 'T-Money (Togocom)',
  flooz: 'Flooz (Moov Africa)',
  mtn: 'MTN MoMo',
  moov: 'Moov Money',
  orange: 'Orange Money',
  wave: 'Wave',
  other: 'Autre',
};

export const deliveryLabel = (o: Pick<Order, 'delivery_method'>) =>
  o.delivery_method === 'delivery' ? 'Livraison' : 'Retrait chez le fournisseur';

/** Étapes affichées dans la frise de suivi (hors annulée). */
export const orderSteps: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Commande créée' },
  { key: 'paid', label: 'Paiement confirmé' },
  { key: 'preparing', label: 'Préparation' },
  { key: 'shipped', label: 'Expédiée' },
  { key: 'delivered', label: 'Livrée' },
];
