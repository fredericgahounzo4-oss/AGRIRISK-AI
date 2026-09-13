import { MOCK_PRODUCTS } from '@/services/mockData';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, Package, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [productToRemove, setProductToRemove] = useState<typeof MOCK_PRODUCTS[number] | null>(null);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const confirmRemove = () => {
    if (!productToRemove) return;
    setProducts((prev) => prev.filter((p) => p.id !== productToRemove.id));
    toast.success(`${productToRemove.name} a été retiré de la plateforme.`);
    setProductToRemove(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits Plateforme</h1>
          <p className="text-sm text-gray-500 mt-1">Supervisez l'ensemble du catalogue produits</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input 
            placeholder="Rechercher par nom, SKU..." 
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Produit</th>
                <th className="px-6 py-4 font-semibold">Fournisseur ID</th>
                <th className="px-6 py-4 font-semibold">Catégorie</th>
                <th className="px-6 py-4 font-semibold">Prix</th>
                <th className="px-6 py-4 font-semibold">Stock & Statut</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">📦</div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{product.supplier_id}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.price.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock} restants</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        product.status === 'Disponible' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setProductToRemove(product)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Retirer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">Aucun produit trouvé.</div>
        )}
      </Card>

      {/* Confirmation de retrait */}
      {productToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Retirer ce produit ?</h2>
              <button onClick={() => setProductToRemove(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">
                  <strong>{productToRemove.name}</strong> (SKU: {productToRemove.sku}) sera retiré du catalogue de la plateforme. Cette action est irréversible.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setProductToRemove(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmRemove}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
