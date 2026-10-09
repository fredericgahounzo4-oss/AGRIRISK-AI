import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, Store, MapPin, Plus, Minus, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/cn';
import { useCatalog } from '../hooks/useShop';
import { useCartStore, selectCartCount } from '../store/cartStore';
import { formatFcfa } from '../orderUi';
import { ProductImage } from '../components/ProductImage';
import { ContactSupplierModal } from '@/features/messages/components/ContactSupplierModal';
import type { CatalogProduct } from '../types';

function ProductCard({ product }: { product: CatalogProduct }) {
  const add = useCartStore((s) => s.add);
  const inCart = useCartStore((s) => s.items.find((i) => i.product_id === product.id)?.quantity ?? 0);
  const [qty, setQty] = useState(1);
  const [contactOpen, setContactOpen] = useState(false);
  const remaining = product.stock - inCart;

  const handleAdd = () => {
    if (remaining <= 0) {
      toast.error('Quantité maximale déjà dans votre panier.');
      return;
    }
    add(product, Math.min(qty, remaining));
    toast.success(`${product.name} ajouté au panier`);
    setQty(1);
  };

  return (
    <Card padding="none" className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <ProductImage src={product.image} alt={product.name} className="h-40 w-full" />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-xs text-[#6b7c6e]">{product.category || 'Produit agricole'}</p>
          <h3 className="font-semibold text-[#1a2e1d] leading-snug">{product.name}</h3>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-[#6b7c6e]">
          <Store className="w-3.5 h-3.5" />
          <span className="truncate">{product.supplier_name}</span>
          {product.supplier_region && (
            <>
              <MapPin className="w-3.5 h-3.5 ml-1" />
              <span className="truncate">{product.supplier_region}</span>
            </>
          )}
        </p>
        <div className="flex items-end justify-between mt-auto pt-2">
          <p className="text-lg font-bold text-[#1a5c2a]">{formatFcfa(product.price)}</p>
          <p className={cn('text-xs', product.stock < 10 ? 'text-amber-600 font-medium' : 'text-[#6b7c6e]')}>
            {product.stock} en stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[#e2e8e4]">
            <button
              type="button"
              className="p-2 text-[#6b7c6e] hover:text-[#1a5c2a] disabled:opacity-40"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Diminuer la quantité"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{qty}</span>
            <button
              type="button"
              className="p-2 text-[#6b7c6e] hover:text-[#1a5c2a] disabled:opacity-40"
              onClick={() => setQty((q) => Math.min(Math.max(remaining, 1), q + 1))}
              disabled={qty >= remaining}
              aria-label="Augmenter la quantité"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" className="flex-1" onClick={handleAdd} disabled={remaining <= 0}
            leftIcon={<ShoppingCart className="w-4 h-4" />}>
            {inCart > 0 ? `Ajouter (${inCart} au panier)` : 'Ajouter'}
          </Button>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={() => setContactOpen(true)}
          leftIcon={<MessageSquare className="w-4 h-4" />}>
          Message
        </Button>
      </div>
      {contactOpen && (
        <ContactSupplierModal
          supplierId={product.supplier_id}
          supplierName={product.supplier_name}
          productId={product.id}
          productName={product.name}
          onClose={() => setContactOpen(false)}
        />
      )}
    </Card>
  );
}

export function ShopPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const [searchParams, setSearchParams] = useSearchParams();
  const supplierFilter = searchParams.get('fournisseur');
  const { data: products = [], isLoading, isError } = useCatalog();
  const cartCount = useCartStore(selectCartCount);

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort()],
    [products]
  );

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.supplier_name.toLowerCase().includes(q)
      || p.category.toLowerCase().includes(q);
    return matchSearch
      && (category === 'Tous' || p.category === category)
      && (!supplierFilter || p.supplier_id === supplierFilter);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2e1d]">Boutique</h1>
          <p className="text-sm text-[#6b7c6e] mt-1">
            Achetez vos intrants directement auprès des fournisseurs.
          </p>
        </div>
        <Link to="/app/panier">
          <Button variant="outline" leftIcon={<ShoppingCart className="w-4 h-4" />}>
            Mon panier{cartCount > 0 ? ` (${cartCount})` : ''}
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Rechercher un produit, un fournisseur…"
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                category === cat
                  ? 'bg-[#1a5c2a] text-white'
                  : 'bg-white border border-[#e2e8e4] text-[#6b7c6e] hover:border-[#1a5c2a] hover:text-[#1a5c2a]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {supplierFilter && (
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f5e9] text-[#1a5c2a] px-3 py-1.5 font-medium">
            <Store className="w-4 h-4" />
            {products.find((p) => p.supplier_id === supplierFilter)?.supplier_name ?? 'Fournisseur sélectionné'}
            <button onClick={() => setSearchParams({})} aria-label="Retirer le filtre" className="hover:opacity-70">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      {isLoading ? (
        <Loader text="Chargement des produits…" />
      ) : isError ? (
        <p className="text-sm text-red-600 text-center py-12">
          Impossible de charger la boutique. Vérifiez que le serveur est bien lancé.
        </p>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Store className="w-10 h-10 text-[#9aab9e] mx-auto mb-3" />
          <p className="font-medium text-[#1a2e1d]">
            {products.length === 0 ? "Aucun produit n'est encore en vente." : 'Aucun produit ne correspond à votre recherche.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
