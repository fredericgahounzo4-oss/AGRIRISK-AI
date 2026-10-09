import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2, Store, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/features/auth/store/authStore';
import { cn } from '@/utils/cn';
import { useCheckout } from '../hooks/useShop';
import { useCartStore } from '../store/cartStore';
import { formatFcfa } from '../orderUi';
import { ProductImage } from '../components/ProductImage';
import type { CartItem, DeliveryMethod } from '../types';

function SupplierGroup({ supplierId, supplierName, items }: {
  supplierId: string; supplierName: string; items: CartItem[];
}) {
  const { user } = useAuthStore();
  const { setQuantity, remove, clearSupplier } = useCartStore();
  const checkout = useCheckout();

  const [method, setMethod] = useState<DeliveryMethod>('pickup');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [note, setNote] = useState('');

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePay = () => {
    if (method === 'delivery' && !address.trim()) {
      toast.error("Indiquez l'adresse de livraison.");
      return;
    }
    if (!phone.trim()) {
      toast.error('Indiquez votre numéro de téléphone.');
      return;
    }
    checkout.mutate(
      {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        delivery_method: method,
        delivery_address: method === 'delivery' ? address.trim() : '',
        phone: phone.trim(),
        note: note.trim(),
      },
      {
        onSuccess: ({ payment_url }) => {
          clearSupplier(supplierId);
          // Redirection vers la page de paiement FedaPay.
          window.location.href = payment_url;
        },
      }
    );
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-[#f7f9f7] border-b border-[#e2e8e4]">
        <Store className="w-4 h-4 text-[#1a5c2a]" />
        <h2 className="font-semibold text-[#1a2e1d]">{supplierName}</h2>
      </div>

      <div className="divide-y divide-[#e2e8e4]">
        {items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-4 p-4">
            <ProductImage src={item.image} alt={item.name} className="h-16 w-16 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1a2e1d] truncate">{item.name}</p>
              <p className="text-sm text-[#6b7c6e]">{formatFcfa(item.price)} / unité</p>
            </div>
            <div className="flex items-center rounded-xl border border-[#e2e8e4]">
              <button className="p-2 text-[#6b7c6e] hover:text-[#1a5c2a] disabled:opacity-40"
                onClick={() => setQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}
                aria-label="Diminuer">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <button className="p-2 text-[#6b7c6e] hover:text-[#1a5c2a] disabled:opacity-40"
                onClick={() => setQuantity(item.product_id, item.quantity + 1)} disabled={item.quantity >= item.stock}
                aria-label="Augmenter">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="w-28 text-right font-semibold text-[#1a2e1d] hidden sm:block">
              {formatFcfa(item.price * item.quantity)}
            </p>
            <button onClick={() => remove(item.product_id)} className="p-2 text-gray-400 hover:text-red-500"
              aria-label="Retirer du panier">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-5 border-t border-[#e2e8e4] space-y-4">
        <div>
          <p className="text-sm font-medium text-[#1a2e1d] mb-2">Réception de la commande</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([
              ['pickup', 'Retrait chez le fournisseur'],
              ['delivery', 'Livraison à mon adresse'],
            ] as [DeliveryMethod, string][]).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setMethod(value)}
                className={cn(
                  'rounded-xl border px-4 py-2.5 text-sm font-medium text-left transition-colors',
                  method === value ? 'border-[#1a5c2a] bg-[#e8f5e9] text-[#1a5c2a]'
                    : 'border-[#e2e8e4] text-[#6b7c6e] hover:border-[#1a5c2a]/50'
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {method === 'delivery' && (
          <Input label="Adresse de livraison" value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="Quartier, village, repère…" />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex : 90 11 22 33" inputMode="tel" />
          <Input label="Message au fournisseur (optionnel)" value={note}
            onChange={(e) => setNote(e.target.value)} maxLength={500} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <p className="text-xs text-[#6b7c6e]">Total à payer</p>
            <p className="text-2xl font-bold text-[#1a5c2a]">{formatFcfa(total)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => clearSupplier(supplierId)}>Vider</Button>
            <Button size="lg" loading={checkout.isPending} onClick={handlePay}
              leftIcon={<Smartphone className="w-5 h-5" />}>
              Payer {formatFcfa(total)} avec FedaPay
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CartPage() {
  const items = useCartStore((s) => s.items);

  const groups = useMemo(() => {
    const map = new Map<string, { supplierName: string; items: CartItem[] }>();
    for (const item of items) {
      const g = map.get(item.supplier_id) ?? { supplierName: item.supplier_name, items: [] };
      g.items.push(item);
      map.set(item.supplier_id, g);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1d]">Mon panier</h1>
        <p className="text-sm text-[#6b7c6e] mt-1">
          Une commande = un fournisseur. Vous payez chaque fournisseur séparément.
        </p>
      </div>

      {groups.length === 0 ? (
        <Card className="text-center py-14">
          <ShoppingCart className="w-10 h-10 text-[#9aab9e] mx-auto mb-3" />
          <p className="font-medium text-[#1a2e1d]">Votre panier est vide</p>
          <Link to="/app/boutique" className="inline-block mt-4">
            <Button>Découvrir la boutique</Button>
          </Link>
        </Card>
      ) : (
        <>
          {groups.map(([supplierId, g]) => (
            <SupplierGroup key={supplierId} supplierId={supplierId} supplierName={g.supplierName} items={g.items} />
          ))}
        </>
      )}
    </div>
  );
}
