import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSimulatePayment } from '../hooks/useShop';

/** Page de test (développement local sans clé FedaPay). N'existe pas côté backend en production. */
export function PaymentSimulationPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const navigate = useNavigate();
  const simulate = useSimulatePayment();

  const run = (outcome: 'approved' | 'declined') => {
    if (!orderId) return;
    simulate.mutate({ id: orderId, outcome }, {
      onSuccess: () => navigate(`/app/paiement/retour?order=${orderId}`),
    });
  };

  return (
    <Card className="max-w-md mx-auto text-center py-10 space-y-4">
      <FlaskConical className="w-12 h-12 mx-auto text-amber-500" />
      <h1 className="text-xl font-bold text-[#1a2e1d]">Paiement simulé</h1>
      <p className="text-sm text-[#6b7c6e]">
        Mode test : aucune clé FedaPay n'est configurée. Choisissez le résultat du paiement.
      </p>
      <div className="flex justify-center gap-2">
        <Button loading={simulate.isPending} onClick={() => run('approved')}>Paiement réussi</Button>
        <Button variant="danger" loading={simulate.isPending} onClick={() => run('declined')}>Paiement refusé</Button>
      </div>
    </Card>
  );
}
