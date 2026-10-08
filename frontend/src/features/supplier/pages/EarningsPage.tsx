import { useState } from 'react';
import { Wallet, Hourglass, BadgeCheck, TrendingUp, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { useEarnings, useSavePayoutAccount } from '@/features/shop/hooks/useShop';
import { formatFcfa, operatorLabel } from '@/features/shop/orderUi';
import type { PayoutAccount } from '@/features/shop/types';

function Stat({ icon: Icon, label, value, hint, tone }: {
  icon: typeof Wallet; label: string; value: number; hint: string; tone: string;
}) {
  return (
    <Card padding="md" className="space-y-2">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="w-5 h-5" /></div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{formatFcfa(value)}</p>
      <p className="text-xs text-gray-400">{hint}</p>
    </Card>
  );
}

export function EarningsPage() {
  const { data, isLoading, isError } = useEarnings();
  const save = useSavePayoutAccount();
  // `draft` = modifications en cours ; sinon on affiche le compte enregistré.
  const [draft, setDraft] = useState<PayoutAccount | null>(null);
  const form: PayoutAccount =
    draft ?? data?.payout_account ?? { operator: 'tmoney', phone: '', account_name: '' };
  const setForm = (value: PayoutAccount) => setDraft(value);

  if (isLoading) return <Loader text="Chargement de vos revenus…" />;
  if (isError || !data) return <p className="text-sm text-red-600 text-center py-12">Impossible de charger vos revenus.</p>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenus</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vos ventes, ce qui vous sera reversé et votre compte Mobile Money. Commission AgriRisk AI : {data.commission_percent}%.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Hourglass} label="En cours" value={data.pending_amount}
          hint="Payé par le client, en attente de livraison" tone="bg-amber-50 text-amber-600" />
        <Stat icon={Wallet} label="À recevoir" value={data.available_amount}
          hint="Livré — reversement sur votre Mobile Money" tone="bg-blue-50 text-blue-600" />
        <Stat icon={BadgeCheck} label="Déjà reversé" value={data.paid_out_amount}
          hint="Argent déjà envoyé" tone="bg-green-50 text-green-600" />
        <Stat icon={TrendingUp} label="Ventes totales" value={data.total_sales}
          hint={`${data.orders_count} commande(s) · commission ${formatFcfa(data.total_commission)}`}
          tone="bg-purple-50 text-purple-600" />
      </div>

      <Card padding="md" className="space-y-4 max-w-xl">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#1a5c2a]" />
          <h2 className="text-lg font-bold text-gray-900">Compte de reversement</h2>
        </div>
        <p className="text-sm text-gray-500">
          Dès que le client a confirmé la réception, votre part (prix − commission) est envoyée sur ce numéro Mobile Money.
        </p>
        {!data.payout_account && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            Renseignez votre numéro pour pouvoir être payé.
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a2e1d]" htmlFor="operator">Opérateur</label>
          <select id="operator"
            className="w-full rounded-xl border border-[#e2e8e4] bg-white px-4 py-2.5 text-sm text-[#1a2e1d] focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20"
            value={form.operator}
            onChange={(e) => setForm({ ...form, operator: e.target.value as PayoutAccount['operator'] })}>
            {Object.entries(operatorLabel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <Input label="Numéro Mobile Money" value={form.phone} inputMode="tel" placeholder="Ex : 90 11 22 33"
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="Nom du titulaire" value={form.account_name}
          onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
        <Button loading={save.isPending} disabled={!form.phone.trim()} onClick={() => save.mutate(form)}>
          Enregistrer
        </Button>
      </Card>
    </div>
  );
}
