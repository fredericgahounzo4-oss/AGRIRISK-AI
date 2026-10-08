import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/cn';
import { useOrders } from '../hooks/useShop';
import { formatFcfa, orderStatusLabel, orderStatusStyle } from '../orderUi';
import type { OrderStatus } from '../types';

const tabs: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'À payer' },
  { key: 'paid', label: 'Payées' },
  { key: 'shipped', label: 'Expédiées' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
];

export function MyOrdersPage() {
  const { data: orders = [], isLoading, isError } = useOrders();
  const [tab, setTab] = useState<'all' | OrderStatus>('all');

  const filtered = orders.filter((o) => tab === 'all' || o.status === tab
    || (tab === 'paid' && o.status === 'preparing'));

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1d]">Mes commandes</h1>
        <p className="text-sm text-[#6b7c6e] mt-1">Suivez vos achats et vos paiements.</p>
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

      {isLoading ? (
        <Loader text="Chargement des commandes…" />
      ) : isError ? (
        <p className="text-sm text-red-600 text-center py-12">Impossible de charger vos commandes.</p>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <ClipboardList className="w-10 h-10 text-[#9aab9e] mx-auto mb-3" />
          <p className="font-medium text-[#1a2e1d]">Aucune commande</p>
          <Link to="/app/boutique" className="inline-block mt-4"><Button>Aller à la boutique</Button></Link>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((o) => (
            <Link key={o.id} to={`/app/commandes/${o.id}`}>
              <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#1a2e1d]">{o.reference}</p>
                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', orderStatusStyle[o.status])}>
                      {orderStatusLabel[o.status]}
                    </span>
                  </div>
                  <p className="text-sm text-[#6b7c6e] mt-1 truncate">
                    {o.supplier_name} · {o.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <p className="font-bold text-[#1a5c2a] whitespace-nowrap">{formatFcfa(o.subtotal)}</p>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
