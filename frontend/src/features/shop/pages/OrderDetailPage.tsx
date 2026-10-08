import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Truck, Store, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/cn';
import { useOrder, usePayOrder, useCancelOrder, useConfirmDelivery } from '../hooks/useShop';
import { deliveryLabel, formatFcfa, orderStatusLabel, orderStatusStyle } from '../orderUi';
import { OrderTimeline } from '../components/OrderTimeline';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrder(id);
  const pay = usePayOrder();
  const cancel = useCancelOrder();
  const confirm = useConfirmDelivery();

  if (isLoading) return <Loader text="Chargement de la commande…" />;
  if (isError || !order) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-red-600">Commande introuvable.</p>
        <Link to="/app/commandes"><Button variant="outline">Retour à mes commandes</Button></Link>
      </div>
    );
  }

  const handlePay = () =>
    pay.mutate(order.id, { onSuccess: ({ payment_url }) => { window.location.href = payment_url; } });

  return (
    <div className="space-y-5 max-w-3xl">
      <Link to="/app/commandes" className="inline-flex items-center gap-2 text-sm text-[#6b7c6e] hover:text-[#1a5c2a]">
        <ArrowLeft className="w-4 h-4" /> Mes commandes
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-[#1a2e1d]">Commande {order.reference}</h1>
        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', orderStatusStyle[order.status])}>
          {orderStatusLabel[order.status]}
        </span>
      </div>

      <Card><OrderTimeline order={order} /></Card>

      {order.status === 'pending' && (
        <Card className="border-amber-200 bg-amber-50 space-y-3">
          <p className="text-sm text-amber-800">
            {order.payment_status === 'declined' || order.payment_status === 'canceled'
              ? "Votre dernier paiement n'a pas abouti. Vous pouvez réessayer."
              : 'Cette commande attend votre paiement. Sans paiement, elle sera annulée automatiquement et le stock libéré.'}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button loading={pay.isPending} onClick={handlePay}>Payer {formatFcfa(order.subtotal)}</Button>
            <Button variant="ghost" loading={cancel.isPending} onClick={() => cancel.mutate(order.id)}>
              Annuler la commande
            </Button>
          </div>
        </Card>
      )}

      {order.status === 'shipped' && (
        <Card className="border-green-200 bg-green-50 space-y-3">
          <p className="text-sm text-green-800">
            Vous avez reçu votre commande ? Confirmez-le pour que le fournisseur soit payé.
          </p>
          <Button loading={confirm.isPending} onClick={() => confirm.mutate(order.id)}>
            J'ai bien reçu ma commande
          </Button>
        </Card>
      )}

      {order.status === 'cancelled' && order.refund_status !== 'none' && (
        <Card className="border-blue-200 bg-blue-50 text-sm text-blue-800">
          {order.refund_status === 'needed'
            ? 'Votre remboursement est en cours de traitement par AgriRisk AI.'
            : 'Vous avez été remboursé.'}
        </Card>
      )}

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-3 bg-[#f7f9f7] border-b border-[#e2e8e4] font-semibold text-[#1a2e1d]">Articles</div>
        <div className="divide-y divide-[#e2e8e4]">
          {order.items.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-[#1a2e1d] truncate">{i.product_name}</p>
                <p className="text-[#6b7c6e]">{i.quantity} × {formatFcfa(i.unit_price)}</p>
              </div>
              <p className="font-semibold">{formatFcfa(i.line_total)}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#e2e8e4]">
          <span className="font-semibold text-[#1a2e1d]">Total</span>
          <span className="text-xl font-bold text-[#1a5c2a]">{formatFcfa(order.subtotal)}</span>
        </div>
      </Card>

      <Card className="space-y-3 text-sm text-gray-700">
        <p className="flex items-center gap-2"><Store className="w-4 h-4 text-gray-400" /> {order.supplier_name}</p>
        <p className="flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400" /> {deliveryLabel(order)}</p>
        {order.delivery_address && (
          <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {order.delivery_address}</p>
        )}
        {order.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {order.phone}</p>}
        {order.note && <p className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-gray-400" /> {order.note}</p>}
      </Card>
    </div>
  );
}
