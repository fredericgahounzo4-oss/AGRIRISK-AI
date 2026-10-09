import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { shopApi } from '../api/shopApi';
import { useCartStore } from '../store/cartStore';
import { formatFcfa } from '../orderUi';
import { useQueryClient } from '@tanstack/react-query';
import type { Order } from '../types';

type Phase = 'checking' | 'paid' | 'failed' | 'waiting';

const MAX_ATTEMPTS = 8;
const DELAY_MS = 3500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Page où FedaPay renvoie l'acheteur après le paiement. On NE se fie PAS aux
 * paramètres de l'URL : le backend relit le statut réel chez FedaPay. Pour
 * le Mobile Money, la confirmation peut prendre quelques secondes → on réessaie.
 */
export function PaymentReturnPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [phase, setPhase] = useState<Phase>('checking');
  const [order, setOrder] = useState<Order | null>(null);
  const started = useRef(false);
  const qc = useQueryClient();
  const clearSupplier = useCartStore((s) => s.clearSupplier);

  useEffect(() => {
    if (!orderId || started.current) return;
    started.current = true;
    let cancelled = false;

    (async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !cancelled; attempt++) {
        try {
          const o = await shopApi.verifyPayment(orderId);
          if (cancelled) return;
          setOrder(o);
          if (o.status !== 'pending') {
            if (o.status === 'cancelled') { setPhase('failed'); return; }
            clearSupplier(o.supplier_id);
            setPhase('paid');
            qc.invalidateQueries({ queryKey: ['orders'] });
            return;
          }
          if (o.payment_status === 'declined' || o.payment_status === 'canceled' || o.payment_status === 'expired') {
            setPhase('failed');
            return;
          }
        } catch {
          // erreur réseau passagère : on réessaie
        }
        await sleep(DELAY_MS);
      }
      if (!cancelled) setPhase('waiting');
    })();

    return () => { cancelled = true; };
  }, [orderId, qc, clearSupplier]);

  if (!orderId) {
    return (
      <Card className="max-w-md mx-auto text-center py-10 space-y-3">
        <p className="text-sm text-gray-600">Lien de paiement invalide.</p>
        <Link to="/app/commandes"><Button variant="outline">Mes commandes</Button></Link>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto text-center py-10 space-y-4">
      {phase === 'checking' && (
        <>
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#1a5c2a]" />
          <h1 className="text-xl font-bold text-[#1a2e1d]">Vérification du paiement…</h1>
          <p className="text-sm text-[#6b7c6e]">
            Si une validation vous est demandée sur votre téléphone, confirmez-la. Ne fermez pas cette page.
          </p>
        </>
      )}
      {phase === 'paid' && (
        <>
          <CheckCircle2 className="w-14 h-14 mx-auto text-[#22c55e]" />
          <h1 className="text-xl font-bold text-[#1a2e1d]">Paiement confirmé !</h1>
          {order && (
            <p className="text-sm text-[#6b7c6e]">
              Commande {order.reference} · {formatFcfa(order.subtotal)}. Le fournisseur a été prévenu.
            </p>
          )}
        </>
      )}
      {phase === 'failed' && (
        <>
          <XCircle className="w-14 h-14 mx-auto text-red-500" />
          <h1 className="text-xl font-bold text-[#1a2e1d]">Paiement non abouti</h1>
          <p className="text-sm text-[#6b7c6e]">Vous n'avez pas été débité. Vous pouvez réessayer depuis votre commande.</p>
        </>
      )}
      {phase === 'waiting' && (
        <>
          <Clock className="w-14 h-14 mx-auto text-amber-500" />
          <h1 className="text-xl font-bold text-[#1a2e1d]">Paiement en attente</h1>
          <p className="text-sm text-[#6b7c6e]">
            Nous n'avons pas encore reçu la confirmation de FedaPay. Si vous avez été débité, votre commande
            sera mise à jour automatiquement dans quelques minutes.
          </p>
        </>
      )}

      {phase !== 'checking' && (
        <div className="flex justify-center gap-2 pt-2">
          <Link to={`/app/commandes/${orderId}`}><Button>Voir ma commande</Button></Link>
          <Link to="/app/boutique"><Button variant="outline">Continuer mes achats</Button></Link>
        </div>
      )}
    </Card>
  );
}
