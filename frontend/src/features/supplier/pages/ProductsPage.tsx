import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Plus, Search, Filter, Edit, Trash2, X } from 'lucide-react';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useMarketplace';
import type { Product } from '../types';

type ProductFormState = {
  name: string;
  category: string;
  price: string;
  stock: string;
  status: Product['status'];
  sku: string;
};

const emptyForm: ProductFormState = {
  name: '',
  category: '',
  price: '',
  stock: '',
  status: 'Disponible',
  sku: '',
};

export function ProductsPage() {
  const { data: products = [], isLoading, isError } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
      sku: product.sku,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      status: form.status,
      sku: form.sku,
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, payload },
        { onSuccess: closeForm }
      );
    } else {
      createProduct.mutate(payload, { onSuccess: closeForm });
    }
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Supprimer "${product.name}" ? Cette action est irréversible.`)) {
      deleteProduct.mutate(product.id);
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Produits</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez votre catalogue d'articles</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateForm}>
          Ajouter un produit
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher un produit ou SKU..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
          Filtres
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <Loader text="Chargement des produits…" />
        ) : isError ? (
          <p className="text-sm text-red-600 text-center py-12">
            Impossible de charger les produits. Vérifiez que le serveur est bien lancé.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-semibold">Produit</th>
                  <th className="px-6 py-4 font-semibold">Catégorie</th>
                  <th className="px-6 py-4 font-semibold">Prix (FCFA)</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            '📦'
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {product.price.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          product.stock === 0
                            ? 'text-red-600'
                            : product.stock < 50
                            ? 'text-amber-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          product.status === 'Disponible'
                            ? 'bg-green-50 text-green-700'
                            : product.status === 'Rupture'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(product)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleteProduct.isPending}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {products.length === 0
              ? "Aucun produit pour l'instant. Ajoutez votre premier article !"
              : 'Aucun produit trouvé.'}
          </div>
        )}
      </Card>

      {/* Modal Ajouter / Modifier */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Nom du produit"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Catégorie"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
                <Input
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prix (FCFA)"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as Product['status'] }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Rupture">Rupture</option>
                  <option value="Bientôt disponible">Bientôt disponible</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={isSaving} className="flex-1">
                  {editingProduct ? 'Enregistrer' : 'Ajouter'}
                </Button>
                <Button type="button" variant="ghost" onClick={closeForm} disabled={isSaving}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
