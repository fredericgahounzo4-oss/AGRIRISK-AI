import { useState } from 'react';
import { Search, Phone, MapPin, Truck, Clock, MessageSquare, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/cn';
import { useOrders, useSupplierOrderStatus } from '@/features/shop/hooks/useShop';
import {
  deliveryLabel, formatFcfa, orderStatusLabel, orderStatusStyle,
} from '@/features/shop/orderUi';
import type { Order, OrderStatus } from '@/features/shop/types';

const tabs: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'paid', label: 'À préparer' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'shipped', label: 'Expédiées' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
];

function OrderCard({ order }: { order: Order }) {
  const setStatus = useSupplierOrderStatus();

  const handleCancel = () => {
    if (window.confirm(
      `Annuler la commande ${order.reference} ? ${order.buyer_name} sera remboursé et le stock remis en vente.`
    )) {
      setStatus.mutate({ id: order.id, status: 'cancelled' });
    }
  };

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{order.reference}</h3>
            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', orderStatusStyle[order.status])}>
              {orderStatusLabel[order.status]}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Client : <span className="font-medium text-gray-900">{order.buyer_name}</span></p>
        </div>
        <div className="sm:text-right">
          <p className="text-lg font-bold text-[#1a5c2a]">{formatFcfa(order.supplier_amount)}</p>
          <p className="text-xs text-gray-500">
            net · total client {formatFcfa(order.subtotal)} − commission {formatFcfa(order.commission_amount)}
          </p>
        </div>
      </div>

      <ul className="text-sm text-gray-700 bg-[#f7f9f7] rounded-xl divide-y divide-gray-100">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between px-4 py-2">
            <span>{i.quantity} × {i.product_name}</span>
            <span className="font-medium">{formatFcfa(i.line_total)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />
          {new Date(order.paid_at ?? order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {deliveryLabel(order)}</span>
        {order.delivery_address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {order.delivery_address}</span>}
        {order.phone && <a href={`tel:${order.phone}`} className="flex items-center gap-1 text-[#1a5c2a] font-medium"><Phone className="w-3.5 h-3.5" /> {order.phone}</a>}
        {order.note && <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {order.note}</span>}
      </div>

      {order.status === 'cancelled' && order.refund_status === 'needed' && (
        <p className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4" /> Le remboursement du client est en cours de traitement par AgriRisk AI.
        </p>
      )}
      {order.status === 'shipped' && (
        <p className="text-xs text-gray-500">En attente de la confirmation de réception du client pour libérer votre paiement.</p>
      )}
      {order.status === 'delivered' && (
        <p className="text-xs text-green-700">
          {order.payout_status === 'paid' ? 'Reversement effectué.' : 'Livrée — reversement en attente.'}
        </p>
      )}

      {(order.status === 'paid' || order.status === 'preparing') && (
        <div className="flex gap-2 flex-wrap pt-1 border-t border-gray-100">
          {order.status === 'paid' && (
            <Button size="sm" loading={setStatus.isPending}
              onClick={() => setStatus.mutate({ id: order.id, status: 'preparing' })}>
              Commencer la préparation
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button size="sm" loading={setStatus.isPending}
              onClick={() => setStatus.mutate({ id: order.id, status: 'shipped' })}>
              {order.delivery_method === 'pickup' ? 'Prête pour le retrait' : 'Marquer comme expédiée'}
            </Button>
          )}
          <Button size="sm" variant="ghost" disabled={setStatus.isPending} onClick={handleCancel}>
            Annuler & rembourser
          </Button>
        </div>
      )}
    </Card>
  );
}

export function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useOrders();
  const [tab, setTab] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = orders.filter((o) =>
    (tab === 'all' || o.status === tab) &&
    (o.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.reference.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.product_name.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <p className="text-sm text-gray-500 mt-1">Commandes déjà payées par les agriculteurs, prêtes à être traitées.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input placeholder="Rechercher un client, une référence, un produit…"
            leftIcon={<Search className="w-4 h-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                tab === t.key ? 'bg-[#1a5c2a] text-white'
                  : 'bg-white border border-[#e2e8e4] text-[#6b7c6e] hover:border-[#1a5c2a] hover:text-[#1a5c2a]')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loader text="Chargement des commandes…" />
      ) : isError ? (
        <p className="text-sm text-red-600 text-center py-12">Impossible de charger les commandes.</p>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {orders.length === 0 ? "Aucune commande payée pour l'instant." : 'Aucune commande trouvée.'}
        </div>
      ) : (
        <div className="grid gap-4">{filtered.map((o) => <OrderCard key={o.id} order={o} />)}</div>
      )}
    </div>
  );
}
